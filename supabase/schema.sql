-- BudgetBuddy Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- null = default/system category
  name text not null,
  icon text not null default 'circle',
  color text not null default '#6366f1',
  monthly_budget numeric(10,2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Users can view their and default categories" on categories
  for select using (user_id is null or auth.uid() = user_id);

create policy "Users can manage their own categories" on categories
  for all using (auth.uid() = user_id);

-- Default categories (system-wide, user_id = null)
insert into categories (id, user_id, name, icon, color, sort_order) values
  ('00000000-0000-0000-0000-000000000001', null, 'Food & Drinks', 'utensils', '#f59e0b', 1),
  ('00000000-0000-0000-0000-000000000002', null, 'Transport', 'car', '#3b82f6', 2),
  ('00000000-0000-0000-0000-000000000003', null, 'Housing', 'home', '#8b5cf6', 3),
  ('00000000-0000-0000-0000-000000000004', null, 'Entertainment', 'tv', '#ec4899', 4),
  ('00000000-0000-0000-0000-000000000005', null, 'Shopping', 'shopping-bag', '#10b981', 5),
  ('00000000-0000-0000-0000-000000000006', null, 'Health', 'heart', '#ef4444', 6),
  ('00000000-0000-0000-0000-000000000007', null, 'Education', 'book', '#6366f1', 7),
  ('00000000-0000-0000-0000-000000000008', null, 'Savings', 'piggy-bank', '#14b8a6', 8),
  ('00000000-0000-0000-0000-000000000009', null, 'Other', 'more-horizontal', '#6b7280', 9)
on conflict (id) do nothing;

-- ============================================================
-- BUDGETS
-- ============================================================
create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null, -- stored as YYYY-MM-01
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month)
);

alter table budgets enable row level security;

create policy "Users can manage own budgets" on budgets
  for all using (auth.uid() = user_id);

-- ============================================================
-- GROUPS
-- ============================================================
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table groups enable row level security;

create policy "Group members can view groups" on groups
  for select using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Users can create groups" on groups
  for insert with check (auth.uid() = created_by);

create policy "Group creator can update groups" on groups
  for update using (auth.uid() = created_by);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create table if not exists group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

alter table group_members enable row level security;

create policy "Members can view group membership" on group_members
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups" on group_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave groups" on group_members
  for delete using (auth.uid() = user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null,
  category_id uuid references categories(id),
  date date not null default current_date,
  is_split boolean not null default false,
  group_id uuid references groups(id) on delete set null,
  paid_by uuid references auth.users(id), -- who paid (for split)
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "Users can view own expenses and group expenses" on expenses
  for select using (
    auth.uid() = user_id or
    (group_id is not null and exists (
      select 1 from group_members
      where group_members.group_id = expenses.group_id
      and group_members.user_id = auth.uid()
    ))
  );

create policy "Users can manage own expenses" on expenses
  for all using (auth.uid() = user_id);

-- ============================================================
-- SPLIT EXPENSES
-- ============================================================
create table if not exists split_expenses (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid not null references expenses(id) on delete cascade unique,
  split_method text not null check (split_method in ('equal', 'percentage', 'custom', 'selected')),
  created_at timestamptz not null default now()
);

alter table split_expenses enable row level security;

create policy "Group members can view split expenses" on split_expenses
  for select using (
    exists (
      select 1 from expenses e
      join group_members gm on gm.group_id = e.group_id
      where e.id = split_expenses.expense_id
      and gm.user_id = auth.uid()
    ) or
    exists (
      select 1 from expenses e
      where e.id = split_expenses.expense_id
      and e.user_id = auth.uid()
    )
  );

create policy "Expense owner can manage split" on split_expenses
  for all using (
    exists (
      select 1 from expenses
      where expenses.id = split_expenses.expense_id
      and expenses.user_id = auth.uid()
    )
  );

-- ============================================================
-- SPLIT SHARES
-- ============================================================
create table if not exists split_shares (
  id uuid primary key default uuid_generate_v4(),
  split_expense_id uuid not null references split_expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  amount numeric(10,2) not null,
  is_settled boolean not null default false,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table split_shares enable row level security;

create policy "Users can view shares involving them" on split_shares
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from split_expenses se
      join expenses e on e.id = se.expense_id
      where se.id = split_shares.split_expense_id
      and e.user_id = auth.uid()
    )
  );

create policy "Users can update own shares" on split_shares
  for update using (auth.uid() = user_id);

create policy "Expense owner can manage shares" on split_shares
  for all using (
    exists (
      select 1 from split_expenses se
      join expenses e on e.id = se.expense_id
      where se.id = split_shares.split_expense_id
      and e.user_id = auth.uid()
    )
  );

-- ============================================================
-- SETTLEMENTS
-- ============================================================
create table if not exists settlements (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references auth.users(id),
  to_user_id uuid not null references auth.users(id),
  amount numeric(10,2) not null,
  group_id uuid references groups(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table settlements enable row level security;

create policy "Users can view settlements involving them" on settlements
  for select using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

create policy "Users can create settlements" on settlements
  for insert with check (auth.uid() = from_user_id);

-- ============================================================
-- RECURRING EXPENSES
-- ============================================================
create table if not exists recurring_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null,
  category_id uuid references categories(id),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table recurring_expenses enable row level security;

create policy "Users can manage own recurring expenses" on recurring_expenses
  for all using (auth.uid() = user_id);

-- ============================================================
-- USER METRIC PREFERENCES
-- ============================================================
create table if not exists user_metric_prefs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  metric_1 text not null default 'budget_left',
  metric_2 text not null default 'daily_avg_left',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_metric_prefs enable row level security;

create policy "Users can manage own metric prefs" on user_metric_prefs
  for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists expenses_user_id_date_idx on expenses(user_id, date desc);
create index if not exists expenses_group_id_idx on expenses(group_id);
create index if not exists split_shares_user_id_idx on split_shares(user_id);
create index if not exists split_shares_settled_idx on split_shares(is_settled);
create index if not exists budgets_user_month_idx on budgets(user_id, month);
create index if not exists group_members_group_id_idx on group_members(group_id);
create index if not exists group_members_user_id_idx on group_members(user_id);
