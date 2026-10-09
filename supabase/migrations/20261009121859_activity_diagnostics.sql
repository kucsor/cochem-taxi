-- Preserve historical codes and aggregates. Add precise safe failure categories.
alter table public.analytics_events drop constraint analytics_events_outcome_check;
alter table public.analytics_events add constraint analytics_events_outcome_check check(outcome in ('network_or_timeout','request_failed','geocoding','geocoding_start','geocoding_end','geocoding_both','routing','rate_limited','validation','server_error','cochem_only','forbidden','success'));

create or replace function public.analytics_insights(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production') returns jsonb
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
 'recent',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from (select id,created_at,name,path,device,language,source,outcome,origin,coalesce(destination,'unknown') destination,route_version,passengers,tariff,fare,distance,after_estimate from public.analytics_events where environment=p_environment and (p_language='' or language=p_language) and (p_device='' or device=p_device) and created_at>=p_from::timestamp at time zone 'Europe/Berlin' and created_at<(p_to+1)::timestamp at time zone 'Europe/Berlin' order by created_at desc,id desc limit 200) r),
 'recent_errors',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from (select id,created_at,name,path,device,language,source,outcome,origin,coalesce(destination,'unknown') destination,route_version,passengers,tariff,fare,distance,after_estimate from public.analytics_events where name='calculator_error' and environment=p_environment and (p_language='' or language=p_language) and (p_device='' or device=p_device) and created_at>=p_from::timestamp at time zone 'Europe/Berlin' and created_at<(p_to+1)::timestamp at time zone 'Europe/Berlin' order by created_at desc,id desc limit 100) r)
) from f;
$$;
revoke all on function public.analytics_insights(date,date,text,text,text) from public,anon,authenticated;
grant execute on function public.analytics_insights(date,date,text,text,text) to service_role;
