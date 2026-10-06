-- Apply once after schema.sql and admin-sessions.sql. Backward compatible with the old report.
alter table public.analytics_events drop constraint analytics_events_name_check;
alter table public.analytics_events add constraint analytics_events_name_check check(name in ('destination_search','destination_select','pickup_select','passenger_change','time_change','map_toggle','location_success','location_error','page_view','click_call_now','click_calculator','use_calculator','calculator_success','calculator_error','click_locate_me','change_language','view_legal','click_home_nav','click_services_nav','click_scroll_top','load_map_click','view_activities','consent_accept','consent_reject','service_click','navigation_click','outbound_click','email_click','scroll_depth','engagement'));
alter table public.analytics_events add column destination text check(destination in ('unknown','other','airport-hahn','airport-frankfurt','airport-koeln-bonn','airport-duesseldorf','airport-luxemburg','cochem','klotten','valwig','valwigerberg','bruttig-fankel','ernst','beilstein','landkern','faid','treis-karden','ediger-eller','senheim','bremm','briedern','kaisersesch','ulmen','zell-mosel','koblenz','trier','burg-eltz','reichsburg')), add column passengers text check(passengers in ('1-4','5-8')), add column tariff text check(tariff in ('day','night')), add column fare numeric check(fare between 0 and 10000), add column distance numeric check(distance between 0 and 3000);
create table public.analytics_daily (
 day date not null, environment text not null, dimensions jsonb not null,
 count bigint not null default 0, value_sum bigint not null default 0,
 fare_sum numeric not null default 0, fare_count bigint not null default 0,
 distance_sum numeric not null default 0, distance_count bigint not null default 0,
 last_at timestamptz not null,
 primary key(day,environment,dimensions)
);
alter table public.analytics_daily enable row level security;
revoke all on public.analytics_daily from public,anon,authenticated;
grant select,insert,update,delete on public.analytics_daily to service_role;
create index analytics_daily_environment_day on public.analytics_daily(environment,day);
create function public.analytics_dimensions(e public.analytics_events) returns jsonb language sql immutable security invoker set search_path='' as $$
 select jsonb_build_object('name',e.name,'path',e.path,'language',e.language,'device',e.device,'source',e.source,'referrer',e.referrer,'outcome',coalesce(e.outcome,'unknown'),'destination',coalesce(e.destination,'unknown'),'passengers',coalesce(e.passengers,'unknown'),'tariff',coalesce(e.tariff,'unknown'),'hour',extract(hour from e.created_at at time zone 'Europe/Berlin')::int,'depth',case when e.name='scroll_depth' then e.value else null end);
$$;
revoke all on function public.analytics_dimensions(public.analytics_events) from public,anon,authenticated;
grant execute on function public.analytics_dimensions(public.analytics_events) to service_role;
create function public.analytics_rollup_event() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.analytics_daily(day,environment,dimensions,count,value_sum,fare_sum,fare_count,distance_sum,distance_count,last_at)
 values((new.created_at at time zone 'Europe/Berlin')::date,new.environment,public.analytics_dimensions(new),1,coalesce(new.value,0),coalesce(new.fare,0),case when new.fare is null then 0 else 1 end,coalesce(new.distance,0),case when new.distance is null then 0 else 1 end,new.created_at)
 on conflict(day,environment,dimensions) do update set count=analytics_daily.count+1,value_sum=analytics_daily.value_sum+excluded.value_sum,fare_sum=analytics_daily.fare_sum+excluded.fare_sum,fare_count=analytics_daily.fare_count+excluded.fare_count,distance_sum=analytics_daily.distance_sum+excluded.distance_sum,distance_count=analytics_daily.distance_count+excluded.distance_count,last_at=greatest(analytics_daily.last_at,excluded.last_at);
 return new;
end;$$;
revoke all on function public.analytics_rollup_event() from public,anon,authenticated;
grant execute on function public.analytics_rollup_event() to service_role;
create trigger analytics_rollup after insert on public.analytics_events for each row execute function public.analytics_rollup_event();
insert into public.analytics_daily
 select (e.created_at at time zone 'Europe/Berlin')::date,e.environment,public.analytics_dimensions(e),count(*),coalesce(sum(e.value),0),coalesce(sum(e.fare),0),count(e.fare),coalesce(sum(e.distance),0),count(e.distance),max(e.created_at)
 from public.analytics_events e group by 1,2,3;
select cron.schedule('analytics-aggregate-retention','35 3 * * *',$$delete from public.analytics_daily where day < (now() at time zone 'Europe/Berlin')::date - 730;$$);
create function public.analytics_insights(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production') returns jsonb
language sql stable security invoker set search_path='' as $$
with base as materialized (
 select *,dimensions->>'name' name from public.analytics_daily where environment=p_environment and (p_language='' or dimensions->>'language'=p_language) and (p_device='' or dimensions->>'device'=p_device)
 and day between p_from-(p_to-p_from+1) and p_to and p_to>=p_from and p_to-p_from<=730
), f as materialized (select * from base where day>=p_from), prev as (select * from base where day<p_from),
 daily as (
 select d::date::text as day,coalesce(sum(f.count) filter(where name='page_view'),0) views,coalesce(sum(f.count) filter(where name='click_call_now'),0) calls,coalesce(sum(f.count) filter(where name='use_calculator'),0) calculations,coalesce(sum(f.count) filter(where name='calculator_success'),0) successes,coalesce(sum(f.count) filter(where name='calculator_error'),0) errors
 from generate_series(p_from::timestamp,p_to::timestamp,'1 day') d left join f on f.day=d::date group by d order by d
), groups as (
 select 'events' kind,name label,sum(count) count from f group by 2
 union all
 select 'pages' kind,dimensions->>'path' label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'sources' kind,dimensions->>'referrer' label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'devices' kind,dimensions->>'device' label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'languages' kind,dimensions->>'language' label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'hours' kind,dimensions->>'hour' label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'weekdays' kind,extract(isodow from day)::text label,sum(count) count from f where name='page_view' group by 2
 union all
 select 'callSources' kind,dimensions->>'source' label,sum(count) count from f where name='click_call_now' group by 2
 union all
 select 'outcomes' kind,dimensions->>'outcome' label,sum(count) count from f where name='calculator_error' group by 2
 union all
 select 'depths' kind,dimensions->>'depth' label,sum(count) count from f where name='scroll_depth' group by 2
 union all
 select 'passengers' kind,dimensions->>'passengers' label,sum(count) count from f where name='use_calculator' group by 2
 union all
 select 'tariffs' kind,dimensions->>'tariff' label,sum(count) count from f where name='use_calculator' group by 2
 union all
 select 'featurePages' kind,(dimensions->>'path') || ' · ' || name label,sum(count) count from f where name in ('click_call_now','use_calculator','calculator_error') group by 2
), grouped as (select kind,jsonb_agg(jsonb_build_object('label',label,'count',count) order by count desc,label) data from groups group by kind),
destinations as (
 select dimensions->>'destination' destination,
 coalesce(sum(count) filter(where name='destination_search'),0) searches,
 coalesce(sum(count) filter(where name='destination_select'),0) selections,
 coalesce(sum(count) filter(where name='use_calculator'),0) calculations,
 coalesce(sum(count) filter(where name='calculator_success'),0) successes,
 coalesce(sum(count) filter(where name='calculator_error'),0) errors,
 round(sum(fare_sum) filter(where name='calculator_success')/nullif(sum(fare_count) filter(where name='calculator_success'),0),2) average_fare,
 round(sum(distance_sum) filter(where name='calculator_success')/nullif(sum(distance_count) filter(where name='calculator_success'),0),1) average_distance
 from f where name in ('destination_search','destination_select','use_calculator','calculator_success','calculator_error') group by 1
), destination_trends as (
 select to_char(day,'YYYY-MM') as month,dimensions->>'destination' destination,sum(count) calculations from f where name='use_calculator' group by 1,2 order by 1,3 desc
)
select jsonb_build_object(
 'views',coalesce(sum(count) filter(where name='page_view'),0),'calls',coalesce(sum(count) filter(where name='click_call_now'),0),
 'calculations',coalesce(sum(count) filter(where name='use_calculator'),0),'successes',coalesce(sum(count) filter(where name='calculator_success'),0),'errors',coalesce(sum(count) filter(where name='calculator_error'),0),'total',coalesce(sum(count),0),
 'average_engagement',round(sum(value_sum) filter(where name='engagement')/nullif(sum(count) filter(where name='engagement'),0),1),
 'average_fare',round(sum(fare_sum) filter(where name='calculator_success')/nullif(sum(fare_count) filter(where name='calculator_success'),0),2),
 'previous',(select jsonb_build_object('views',coalesce(sum(count) filter(where name='page_view'),0),'calls',coalesce(sum(count) filter(where name='click_call_now'),0),'calculations',coalesce(sum(count) filter(where name='use_calculator'),0)) from prev),
 'daily',coalesce((select jsonb_agg(to_jsonb(daily)) from daily),'[]'),
 'destinations',coalesce((select jsonb_agg(to_jsonb(destinations) order by calculations desc,searches desc,destination) from destinations),'[]'),
 'destinationTrends',coalesce((select jsonb_agg(to_jsonb(destination_trends)) from destination_trends),'[]'),
 'groups',coalesce((select jsonb_object_agg(kind,data) from grouped),'{}'),
 'updated_at',now(),'last_event',max(last_at),'first_available',(select min(day) from public.analytics_daily where environment=p_environment),
 'timezone','Europe/Berlin','raw_retention_days',90,'aggregate_retention_days',730,
 'recent',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from (select created_at,name,path,device,language,coalesce(destination,'unknown') destination from public.analytics_events where environment=p_environment and (p_language='' or language=p_language) and (p_device='' or device=p_device) and created_at>=p_from::timestamp at time zone 'Europe/Berlin' and created_at<(p_to+1)::timestamp at time zone 'Europe/Berlin' order by created_at desc limit 30) r)
) from f;
$$;
revoke all on function public.analytics_insights(date,date,text,text,text) from public,anon,authenticated;
grant execute on function public.analytics_insights(date,date,text,text,text) to service_role;
