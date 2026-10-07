-- Additive route analytics. Historical rows and rollups are never relabelled.
alter table public.analytics_events
 add column origin text check(origin in ('unknown','other','airport-hahn','airport-frankfurt','airport-koeln-bonn','airport-duesseldorf','airport-luxemburg','cochem','klotten','valwig','valwigerberg','bruttig-fankel','ernst','beilstein','landkern','faid','treis-karden','ediger-eller','senheim','bremm','briedern','kaisersesch','ulmen','zell-mosel','koblenz','trier','burg-eltz','reichsburg')),
 add column route_version smallint check(route_version=2),
 add column after_estimate smallint check(after_estimate=1),
 add constraint analytics_call_attribution_check check(after_estimate is null or (name='click_call_now' and visit is not null and route_version=2));
create or replace function public.analytics_dimensions(e public.analytics_events) returns jsonb language sql immutable security invoker set search_path='' as $$
 select jsonb_build_object('name',e.name,'path',e.path,'language',e.language,'device',e.device,'source',e.source,'referrer',e.referrer,'outcome',coalesce(e.outcome,'unknown'),'destination',coalesce(e.destination,'unknown'),'origin',coalesce(e.origin,'unknown'),'route_version',coalesce(e.route_version,1),'after_estimate',coalesce(e.after_estimate,0),'passengers',coalesce(e.passengers,'unknown'),'tariff',coalesce(e.tariff,'unknown'),'hour',extract(hour from e.created_at at time zone 'Europe/Berlin')::int,'depth',case when e.name='scroll_depth' then e.value else null end);
$$;
create function public.analytics_route_insights(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production') returns jsonb
language sql stable security invoker set search_path='' as $$
with f as materialized (
 select *,dimensions->>'name' name,coalesce(dimensions->>'origin','unknown') origin,coalesce(dimensions->>'destination','unknown') destination
 from public.analytics_daily where environment=p_environment and day between p_from and p_to
 and p_to>=p_from and p_to-p_from<=730
 and (p_language='' or dimensions->>'language'=p_language) and (p_device='' or dimensions->>'device'=p_device)
), v as materialized (select * from f where dimensions->>'route_version'='2'),
raw as materialized (
 select origin,destination,name,visit,after_estimate from public.analytics_events
 where environment=p_environment and route_version=2 and visit is not null
 and created_at>=greatest(p_from,(now() at time zone 'Europe/Berlin')::date-89)::timestamp at time zone 'Europe/Berlin'
 and created_at<(p_to+1)::timestamp at time zone 'Europe/Berlin'
 and (p_language='' or language=p_language) and (p_device='' or device=p_device)
), sessions as (
 select origin,destination,count(distinct visit) filter(where name='use_calculator') sessions,
 count(distinct visit) filter(where name='click_call_now' and after_estimate=1) call_sessions,
 count(*) filter(where name='use_calculator') consented_calculations
 from raw group by 1,2
), route_totals as (
 select origin,destination,
 coalesce(sum(count) filter(where name='use_calculator'),0) calculations,
 coalesce(sum(count) filter(where name='calculator_success'),0) successes,
 coalesce(sum(count) filter(where name='calculator_error'),0) errors,
 coalesce(sum(count) filter(where name='click_call_now' and dimensions->>'after_estimate'='1'),0) call_clicks,
 round(sum(fare_sum) filter(where name='calculator_success')/nullif(sum(fare_count) filter(where name='calculator_success'),0),2) average_fare,
 round(sum(distance_sum) filter(where name='calculator_success')/nullif(sum(distance_count) filter(where name='calculator_success'),0),1) average_distance,
 min(day) first_day,max(day) last_day
 from v where name in ('use_calculator','calculator_success','calculator_error','click_call_now') group by 1,2
), breakdown as (
 select origin,destination,dimensions->>'passengers' passengers,dimensions->>'tariff' tariff,sum(count) calculations
 from v where name='use_calculator' group by 1,2,3,4
), routes as (
 select r.*,case when p_from>=(now() at time zone 'Europe/Berlin')::date-89 then coalesce(s.sessions,0) end sessions,
 case when p_from>=(now() at time zone 'Europe/Berlin')::date-89 then coalesce(s.call_sessions,0) end call_sessions,
 case when p_from>=(now() at time zone 'Europe/Berlin')::date-89 then coalesce(s.consented_calculations,0) end consented_calculations,
 coalesce((select jsonb_agg(jsonb_build_object('passengers',b.passengers,'tariff',b.tariff,'calculations',b.calculations) order by b.calculations desc) from breakdown b where b.origin=r.origin and b.destination=r.destination),'[]') breakdown
 from route_totals r left join sessions s using(origin,destination)
), trends as (
 select day::text as day,origin,destination,sum(count) calculations from v where name='use_calculator' group by 1,2,3 order by 1,2,3
), legacy_destinations as (
 select destination,sum(count) calculations from f where name='use_calculator' and coalesce(dimensions->>'route_version','1')<>'2' group by 1
), interests as (
 select destination,coalesce(sum(count) filter(where name='destination_search'),0) searches,coalesce(sum(count) filter(where name='destination_select'),0) selections from v where name in ('destination_search','destination_select') group by 1
)
select public.analytics_insights(p_from,p_to,p_language,p_device,p_environment) || jsonb_build_object('routeReport',jsonb_build_object(
 'version',2,
 'first_available',(select min(day) from public.analytics_daily where environment=p_environment and dimensions->>'route_version'='2'),
 'sessions_available',p_from>=(now() at time zone 'Europe/Berlin')::date-89,
 'legacy_calculations',coalesce((select sum(count) from f where name='use_calculator' and coalesce(dimensions->>'route_version','1')<>'2'),0),
 'missing_destination',coalesce((select sum(count) from f where name='use_calculator' and destination='unknown'),0),
 'routes',coalesce((select jsonb_agg(to_jsonb(routes) order by calculations desc,origin,destination) from routes),'[]'),
 'daily',coalesce((select jsonb_agg(to_jsonb(trends)) from trends),'[]'),
 'legacy_destinations',coalesce((select jsonb_agg(to_jsonb(legacy_destinations) order by calculations desc) from legacy_destinations),'[]'),
 'interests',coalesce((select jsonb_agg(to_jsonb(interests) order by selections desc,searches desc) from interests),'[]')
));
$$;
revoke all on function public.analytics_route_insights(date,date,text,text,text) from public,anon,authenticated;
grant execute on function public.analytics_route_insights(date,date,text,text,text) to service_role;
