-- NexCoder Polar billing integration.
-- Apply after supabase/schema.sql. Safe to re-run.

insert into public.plans (id, name, best_for, price_cents, billing_interval, per_seat, plan_type, sort_order) values
  ('starter',           'Starter',           'Trying NexCoder',                         0,     'month', false, 'individual', 1),
  ('plus',              'Plus',              'Regular individual developers',           2000,  'month', false, 'individual', 2),
  ('pro',               'Pro',               'Daily agent users',                       3900,  'month', false, 'individual', 3),
  ('premium',           'Premium',           'Maximum individual usage',                9900,  'month', false, 'individual', 4),
  ('business-standard', 'Business Standard', 'Development teams',                       4000,  'month', true,  'team',       5),
  ('business-plus',     'Business Plus',     'Advanced teams',                          12000, 'month', true,  'team',       6),
  ('enterprise',        'Enterprise',        'Large organizations',                     null,  'custom', true,  'enterprise', 7)
on conflict (id) do update set
  name = excluded.name,
  best_for = excluded.best_for,
  price_cents = excluded.price_cents,
  billing_interval = excluded.billing_interval,
  per_seat = excluded.per_seat,
  plan_type = excluded.plan_type,
  sort_order = excluded.sort_order,
  is_active = true;

update public.profiles set plan = 'business-standard' where plan = 'business';
update public.profiles set plan = 'business-plus' where plan = 'business_plus';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_plan_fkey') then
    alter table public.profiles
      add constraint profiles_plan_fkey foreign key (plan) references public.plans (id);
  end if;
end $$;

alter table public.subscriptions add column if not exists polar_customer_id text;
alter table public.subscriptions add column if not exists polar_subscription_id text;
alter table public.subscriptions add column if not exists polar_checkout_id text;
alter table public.subscriptions add column if not exists polar_product_id text;
alter table public.subscriptions add column if not exists polar_order_id text;
alter table public.subscriptions add column if not exists billing_interval text;
alter table public.subscriptions add column if not exists metadata jsonb not null default '{}';

create unique index if not exists subscriptions_polar_subscription_id_idx
  on public.subscriptions (polar_subscription_id)
  where polar_subscription_id is not null;

create table if not exists public.polar_webhook_events (
  id           text primary key,
  event_type   text not null,
  payload      jsonb not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.polar_webhook_events enable row level security;

drop policy if exists polar_webhook_events_no_client_access on public.polar_webhook_events;
create policy polar_webhook_events_no_client_access
  on public.polar_webhook_events for select
  using (false);
