create table public.analytics_events (
 id uuid primary key,
 environment text not null default 'production' check(environment in ('production','preview','development')),
 created_at timestamptz not null default now(),
 name text not null check (name in ('page_view','click_call_now','click_calculator','use_calculator','calculator_success','calculator_error','click_locate_me','change_language','view_legal','click_home_nav','click_services_nav','click_scroll_top','load_map_click','view_activities','consent_accept','consent_reject','service_click','navigation_click','outbound_click','email_click','scroll_depth','engagement')),
 path text not null check (length(path)<=160 and path ~ '^/(de|en|nl)(/[a-z0-9-]+){0,3}$'),
 visit uuid, language text not null check(language in ('de','en','nl')),
 referrer text not null default '' check(length(referrer)<=100 and referrer ~ '^[a-zA-Z0-9.-]*$'),
 device text not null check(device in ('mobile','tablet','desktop')),
 source text not null check(source in ('header','footer','calculator','hero','navigation','service','page','other')),
 value integer check(value between 0 and 3600),
 outcome text check(outcome in ('network_or_timeout','request_failed','geocoding','routing','rate_limited','validation','server_error','success'))
);
create index analytics_events_created on public.analytics_events(created_at);
create index analytics_events_name_created on public.analytics_events(name,created_at);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant select,insert,delete on public.analytics_events to service_role;

create table public.analytics_rate_limits (key text primary key, expires_at timestamptz not null, hits integer not null);
alter table public.analytics_rate_limits enable row level security;
revoke all on public.analytics_rate_limits from anon, authenticated;
grant select,insert,update,delete on public.analytics_rate_limits to service_role;
create index analytics_rate_expiry on public.analytics_rate_limits(expires_at);
create function public.analytics_allow(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 if p_limit not between 1 and 1000 or p_seconds not between 1 and 86400 or length(p_key)<>64 then return false; end if;
 insert into public.analytics_rate_limits(key,expires_at,hits) values(p_key,now()+make_interval(secs=>p_seconds),1)
 on conflict(key) do update set hits=case when public.analytics_rate_limits.expires_at<=now() then 1 else public.analytics_rate_limits.hits+1 end,
 expires_at=case when public.analytics_rate_limits.expires_at<=now() then now()+make_interval(secs=>p_seconds) else public.analytics_rate_limits.expires_at end returning hits into n;
 return n<=p_limit;
end;$$;
revoke all on function public.analytics_allow(text,integer,integer) from public,anon,authenticated;
grant execute on function public.analytics_allow(text,integer,integer) to service_role;

create function public.analytics_report(p_from date,p_to date,p_language text default '',p_device text default '',p_environment text default 'production') returns jsonb
language sql stable security invoker set search_path='' as $$
with filtered as materialized (
 select * from public.analytics_events where created_at >= p_from::timestamp at time zone 'UTC'
 and created_at < (p_to+1)::timestamp at time zone 'UTC'
 and environment=p_environment and (p_language='' or language=p_language) and (p_device='' or device=p_device)
 and p_to>=p_from and p_to-p_from<=365
), previous as (
 select * from public.analytics_events where created_at >= (p_from-(p_to-p_from+1))::timestamp at time zone 'UTC'
 and created_at < p_from::timestamp at time zone 'UTC'
 and environment=p_environment and (p_language='' or language=p_language) and (p_device='' or device=p_device)
), daily as (
 select to_char(d,'YYYY-MM-DD') as day,
 count(f.id) filter(where name='page_view') as views,
 count(f.id) filter(where name='click_call_now') as calls,
 count(f.id) filter(where name='use_calculator') as calculations
 from generate_series(p_from::timestamp,p_to::timestamp,'1 day') d left join filtered f on (f.created_at at time zone 'UTC')::date=d::date group by d order by d
), groups as (
 select 'events' kind,name label,count(*) count from filtered group by name
 union all select 'pages',path,count(*) from filtered where name='page_view' group by path
 union all select 'sources',referrer,count(*) from filtered where name='page_view' group by referrer
 union all select 'devices',device,count(*) from filtered where name='page_view' group by device
 union all select 'languages',language,count(*) from filtered where name='page_view' group by language
 union all select 'hours',to_char(created_at at time zone 'UTC','HH24'),count(*) from filtered where name='page_view' group by 2
 union all select 'callSources',source,count(*) from filtered where name='click_call_now' group by source
 union all select 'outcomes',coalesce(outcome,'unknown'),count(*) from filtered where name='calculator_error' group by outcome
 union all select 'depths',value::text,count(*) from filtered where name='scroll_depth' group by value
), group_json as (
 select kind,jsonb_agg(jsonb_build_object('label',label,'count',count) order by count desc,label) data from groups group by kind
)
select jsonb_build_object(
 'total',count(*),'views',count(*) filter(where name='page_view'),
 'calls',count(*) filter(where name='click_call_now'),'calculations',count(*) filter(where name='use_calculator'),
 'successes',count(*) filter(where name='calculator_success'),'errors',count(*) filter(where name='calculator_error'),
 'visits',count(distinct visit),'first_event',min(created_at),'updated_at',now(),
 'previous',(select jsonb_build_object('views',count(*) filter(where name='page_view'),'calls',count(*) filter(where name='click_call_now'),'calculations',count(*) filter(where name='use_calculator')) from previous),
 'daily',coalesce((select jsonb_agg(to_jsonb(daily)) from daily),'[]'::jsonb),
 'events','[]'::jsonb,'pages','[]'::jsonb,'sources','[]'::jsonb,'devices','[]'::jsonb,'languages','[]'::jsonb,'hours','[]'::jsonb,'callSources','[]'::jsonb,'outcomes','[]'::jsonb,'depths','[]'::jsonb
 ) || coalesce((select jsonb_object_agg(kind,data) from group_json),'{}'::jsonb) from filtered;
$$;
revoke all on function public.analytics_report(date,date,text,text,text) from public,anon,authenticated;
grant execute on function public.analytics_report(date,date,text,text,text) to service_role;

create extension if not exists pg_cron;
select cron.schedule('analytics-retention','17 3 * * *',$$delete from public.analytics_events where created_at < now()-interval '90 days'; delete from public.analytics_rate_limits where expires_at < now()-interval '1 day';$$);
