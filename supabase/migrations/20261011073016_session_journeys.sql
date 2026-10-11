-- Additive telemetry v3: no identifiers in long-term aggregates, no historical backfill.
alter table public.analytics_events
 add column country text check(country ~ '^[A-Z]{2}$'),
 add column measurement_version smallint check(measurement_version=3),
 add column target text check(length(target)<=180),
 add column target_language text check(target_language in ('de','en','nl')),
 add column calculation_id uuid,
 add column call_delay_seconds integer check(call_delay_seconds between 0 and 1800),
 add column visible_ms integer check(visible_ms between 0 and 120000),
 add column active_ms integer check(active_ms between 0 and 120000),
 add constraint analytics_timing_check check(active_ms is null or (visible_ms is not null and active_ms<=visible_ms)),
 add constraint analytics_delay_check check(call_delay_seconds is null or (after_estimate=1 and calculation_id is not null));
alter table public.analytics_events drop constraint analytics_events_name_check;
alter table public.analytics_events add constraint analytics_events_name_check check(name in ('session_start','page_timing','destination_search','destination_select','pickup_select','passenger_change','time_change','map_toggle','location_success','location_error','page_view','click_call_now','click_calculator','use_calculator','calculator_success','calculator_error','click_locate_me','change_language','view_legal','click_home_nav','click_services_nav','click_scroll_top','load_map_click','view_activities','consent_accept','consent_reject','service_click','navigation_click','outbound_click','email_click','scroll_depth','engagement'));
create index analytics_events_visit_time on public.analytics_events(environment,visit,created_at,id) where visit is not null;
alter table public.analytics_daily add column visible_ms_sum bigint not null default 0, add column active_ms_sum bigint not null default 0;
create or replace function public.analytics_dimensions(e public.analytics_events) returns jsonb language sql immutable security invoker set search_path='' as $$
 select jsonb_build_object('country',coalesce(e.country,'unknown'),'measurement_version',coalesce(e.measurement_version,0),'session_measured',e.visit is not null,'target',coalesce(e.target,'unknown'),'target_language',coalesce(e.target_language,'unknown'),'name',e.name,'path',e.path,'language',e.language,'device',e.device,'source',e.source,'referrer',e.referrer,'outcome',coalesce(e.outcome,'unknown'),'destination',coalesce(e.destination,'unknown'),'origin',coalesce(e.origin,'unknown'),'route_version',coalesce(e.route_version,1),'after_estimate',coalesce(e.after_estimate,0),'passengers',coalesce(e.passengers,'unknown'),'tariff',coalesce(e.tariff,'unknown'),'hour',extract(hour from e.created_at at time zone 'Europe/Berlin')::int,'depth',case when e.name='scroll_depth' then e.value else null end);
$$;
create or replace function public.analytics_rollup_event() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.analytics_daily(day,environment,dimensions,count,value_sum,fare_sum,fare_count,distance_sum,distance_count,last_at,visible_ms_sum,active_ms_sum)
 values((new.created_at at time zone 'Europe/Berlin')::date,new.environment,public.analytics_dimensions(new),1,coalesce(new.value,0),coalesce(new.fare,0),case when new.fare is null then 0 else 1 end,coalesce(new.distance,0),case when new.distance is null then 0 else 1 end,new.created_at,coalesce(new.visible_ms,0),coalesce(new.active_ms,0))
 on conflict(day,environment,dimensions) do update set count=analytics_daily.count+1,value_sum=analytics_daily.value_sum+excluded.value_sum,fare_sum=analytics_daily.fare_sum+excluded.fare_sum,fare_count=analytics_daily.fare_count+excluded.fare_count,distance_sum=analytics_daily.distance_sum+excluded.distance_sum,distance_count=analytics_daily.distance_count+excluded.distance_count,visible_ms_sum=analytics_daily.visible_ms_sum+excluded.visible_ms_sum,active_ms_sum=analytics_daily.active_ms_sum+excluded.active_ms_sum,last_at=greatest(analytics_daily.last_at,excluded.last_at);
 return new;
end;$$;

create function public.analytics_journey_insights(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production') returns jsonb
language sql stable security invoker set search_path='' as $$
with f as materialized (
 select *,dimensions->>'name' name,coalesce(dimensions->>'country','unknown') country
 from public.analytics_daily where environment=p_environment and day between p_from and p_to and p_to>=p_from and p_to-p_from<=730
 and (p_language='' or dimensions->>'language'=p_language) and (p_device='' or dimensions->>'device'=p_device)
), countries as (
 select country,coalesce(sum(count) filter(where name='page_view'),0) views,
 coalesce(sum(count) filter(where name='session_start'),0) session_starts,
 coalesce(sum(count) filter(where name='use_calculator'),0) calculations,
 coalesce(sum(count) filter(where name='calculator_success'),0) successes,
 coalesce(sum(count) filter(where name='calculator_error'),0) errors,
 coalesce(sum(count) filter(where name='click_call_now'),0) calls,
 coalesce(sum(count) filter(where name='click_call_now' and dimensions->>'after_estimate'='1'),0) linked_calls,
 sum(visible_ms_sum) visible_ms,sum(active_ms_sum) active_ms
 from f group by country
), routes as (
 select country,coalesce(dimensions->>'origin','unknown') origin,coalesce(dimensions->>'destination','unknown') destination,
 coalesce(sum(count) filter(where name='use_calculator'),0) calculations,
 coalesce(sum(count) filter(where name='calculator_error'),0) errors,
 coalesce(sum(count) filter(where name='click_call_now' and dimensions->>'after_estimate'='1'),0) linked_calls
 from f where name in ('use_calculator','calculator_error') or (name='click_call_now' and dimensions->>'after_estimate'='1') group by 1,2,3
), targets as (
 select name,dimensions->>'source' source,coalesce(dimensions->>'target','unknown') target,coalesce(dimensions->>'target_language','unknown') target_language,sum(count) count
 from f where name not in ('page_timing','engagement','page_view','session_start','scroll_depth') group by 1,2,3,4
), daily as (
 select day,country,coalesce(sum(count) filter(where name='page_view'),0) views,coalesce(sum(count) filter(where name='use_calculator'),0) calculations,coalesce(sum(count) filter(where name='click_call_now'),0) calls from f group by 1,2
)
select public.analytics_route_insights(p_from,p_to,p_language,p_device,p_environment) || jsonb_build_object('journeyReport',jsonb_build_object(
 'version',3,
 'coverage',jsonb_build_object(
  'views',coalesce(sum(count) filter(where name='page_view'),0),
  'country_views',coalesce(sum(count) filter(where name='page_view' and country<>'unknown'),0),
  'session_views',coalesce(sum(count) filter(where name='page_view' and dimensions->>'session_measured'='true'),0),
  'measured_views',coalesce(sum(count) filter(where name='page_view' and dimensions->>'measurement_version'='3'),0),
  'timing_samples',coalesce(sum(count) filter(where name='page_timing'),0),
  'visible_ms',coalesce(sum(visible_ms_sum),0),'active_ms',coalesce(sum(active_ms_sum),0),
  'session_starts',coalesce(sum(count) filter(where name='session_start'),0),
  'calls',coalesce(sum(count) filter(where name='click_call_now'),0),
  'linked_calls',coalesce(sum(count) filter(where name='click_call_now' and dimensions->>'after_estimate'='1'),0),
  'session_calls',coalesce(sum(count) filter(where name='click_call_now' and dimensions->>'session_measured'='true'),0)
 ),
 'countries',coalesce((select jsonb_agg(to_jsonb(countries) order by views desc,country) from countries),'[]'),
 'routes',coalesce((select jsonb_agg(to_jsonb(routes) order by calculations desc,country,origin,destination) from routes),'[]'),
 'targets',coalesce((select jsonb_agg(to_jsonb(targets) order by count desc,name,target) from targets),'[]'),
 'daily',coalesce((select jsonb_agg(to_jsonb(daily) order by day,country) from daily),'[]')
)) from f;
$$;
revoke all on function public.analytics_journey_insights(date,date,text,text,text) from public,anon,authenticated;
grant execute on function public.analytics_journey_insights(date,date,text,text,text) to service_role;

-- Private, bounded, paginated drill-down. Returned actions follow the selected filters.
create function public.analytics_sessions(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production',p_country text default '',p_visit uuid default null,p_offset integer default 0) returns jsonb
language sql stable security invoker set search_path='' as $$
with f as materialized (
 select * from public.analytics_events where environment=p_environment and visit is not null
 and created_at>=greatest(p_from,(now() at time zone 'Europe/Berlin')::date-89)::timestamp at time zone 'Europe/Berlin'
 and created_at<(p_to+1)::timestamp at time zone 'Europe/Berlin'
 and p_to>=p_from and p_to-p_from<=730 and p_offset between 0 and 100000
 and (p_language='' or language=p_language) and (p_device='' or device=p_device)
 and (p_country='' or coalesce(country,'unknown')=p_country) and (p_visit is null or visit=p_visit)
), sessions as (
 select visit,min(created_at) first_at,max(created_at) last_at,extract(epoch from max(created_at)-min(created_at)) span_seconds,
 array_agg(distinct coalesce(country,'unknown')) countries,array_agg(distinct language) languages,array_agg(distinct device) devices,
 count(*) actions,count(*) filter(where name='page_view') views,count(*) filter(where name='use_calculator') calculations,
 count(*) filter(where name='calculator_success') successes,count(*) filter(where name='calculator_error') errors,
 count(*) filter(where name='click_call_now') calls,count(*) filter(where name='click_call_now' and after_estimate=1) linked_calls,
 count(*) filter(where name='page_timing') timing_samples,coalesce(sum(visible_ms),0) visible_ms,coalesce(sum(active_ms),0) active_ms,
 bool_or(name='session_start') recorded_start
 from f group by visit
), page as (select * from sessions order by last_at desc,visit limit 50 offset least(greatest(p_offset,0),100000)),
 events as (select id,created_at,name,path,language,device,source,value,outcome,country,origin,destination,passengers,tariff,fare,distance,after_estimate,calculation_id,call_delay_seconds,target,target_language,visible_ms,active_ms,measurement_version from f where p_visit is not null order by created_at,id limit 200 offset least(greatest(p_offset,0),100000))
select jsonb_build_object('total',(select count(*) from sessions),'events_total',(select count(*) from f where p_visit is not null),
 'sessions',coalesce((select jsonb_agg(to_jsonb(page) order by last_at desc,visit) from page),'[]'),
 'events',coalesce((select jsonb_agg(to_jsonb(events) order by created_at,id) from events),'[]'),
 'retained_from',(now() at time zone 'Europe/Berlin')::date-89,'updated_at',now());
$$;
revoke all on function public.analytics_sessions(date,date,text,text,text,text,uuid,integer) from public,anon,authenticated;
grant execute on function public.analytics_sessions(date,date,text,text,text,text,uuid,integer) to service_role;
