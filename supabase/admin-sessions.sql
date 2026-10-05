create table public.analytics_admin_sessions (hash text primary key check(length(hash)=64),expires_at timestamptz not null);
alter table public.analytics_admin_sessions enable row level security;
revoke all on public.analytics_admin_sessions from anon,authenticated;
grant select,insert,delete on public.analytics_admin_sessions to service_role;
select cron.schedule('analytics-session-retention','37 * * * *',$$delete from public.analytics_admin_sessions where expires_at<now();$$);
