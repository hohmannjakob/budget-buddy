-- BudgetBuddy Seed Data (Demo)
-- NOTE: Run schema.sql first. These inserts use hardcoded UUIDs for demo.
-- In production, users sign up through auth — this is only for local dev testing.

-- Demo users must be created in Supabase Auth dashboard first.
-- Then manually update these UUIDs to match actual auth.users IDs.

-- Demo user placeholders:
-- User A: alice@example.com  → 'aaaaaaaa-0000-0000-0000-000000000001'
-- User B: bob@example.com    → 'bbbbbbbb-0000-0000-0000-000000000001'

-- Profiles
insert into profiles (id, name, onboarding_done) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', true),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Bob', true)
on conflict (id) do nothing;

-- Budgets (March 2026)
insert into budgets (user_id, month, total_amount) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '2026-03-01', 1200.00),
  ('bbbbbbbb-0000-0000-0000-000000000001', '2026-03-01', 900.00)
on conflict (user_id, month) do nothing;

-- Custom category budgets for Alice
insert into categories (user_id, name, icon, color, monthly_budget, sort_order) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Food & Drinks', 'utensils', '#f59e0b', 300.00, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Transport', 'car', '#3b82f6', 100.00, 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Entertainment', 'tv', '#ec4899', 150.00, 4)
on conflict do nothing;

-- Group
insert into groups (id, name, created_by) values
  ('gggggggg-0000-0000-0000-000000000001', 'Flatmates', 'aaaaaaaa-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into group_members (group_id, user_id) values
  ('gggggggg-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('gggggggg-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001')
on conflict (group_id, user_id) do nothing;

-- Personal expenses for Alice (March 2026)
insert into expenses (id, user_id, title, amount, category_id, date, is_split) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Groceries', 45.00, '00000000-0000-0000-0000-000000000001', '2026-03-10', false),
  ('eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Monthly ticket', 49.00, '00000000-0000-0000-0000-000000000002', '2026-03-01', false),
  ('eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Coffee', 4.50, '00000000-0000-0000-0000-000000000001', '2026-03-14', false),
  ('eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Lunch', 12.80, '00000000-0000-0000-0000-000000000001', '2026-03-14', false)
on conflict (id) do nothing;

-- Split expense (Alice paid for dinner)
insert into expenses (id, user_id, title, amount, category_id, date, is_split, group_id, paid_by) values
  ('eeeeeeee-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'Dinner at Trattoria', 80.00, '00000000-0000-0000-0000-000000000001', '2026-03-13', true, 'gggggggg-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into split_expenses (id, expense_id, split_method) values
  ('ssssssss-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000005', 'equal')
on conflict (expense_id) do nothing;

insert into split_shares (split_expense_id, user_id, amount, is_settled) values
  ('ssssssss-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 40.00, true),
  ('ssssssss-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 40.00, false)
on conflict do nothing;

-- Metric prefs for Alice
insert into user_metric_prefs (user_id, metric_1, metric_2) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'budget_left', 'daily_avg_left')
on conflict (user_id) do nothing;
