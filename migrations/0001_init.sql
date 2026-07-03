create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  avatar_url text,
  status text not null check (status in ('active', 'paused', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  welcome_message text,
  system_prompt text,
  temperature numeric(3, 2),
  max_tokens int,
  top_p numeric(3, 2),
  message_limit int,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'enterprise'))
);
create index bots_user_id_idx on bots(user_id);

create table widget_configs (
  bot_id uuid primary key references bots(id) on delete cascade,
  primary_color text,
  accent_color text,
  logo_url text,
  company_name text,
  position text,
  button_size text,
  button_style text,
  starter_prompts jsonb not null default '[]'
);

create table knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  source_type text not null check (source_type in ('file', 'link')),
  title text not null,
  url text,
  size_bytes bigint,
  status text not null check (status in ('processing', 'ready', 'error')),
  error_message text,
  added_at timestamptz not null default now()
);
create index knowledge_documents_bot_id_idx on knowledge_documents(bot_id);

create table dialogs (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  messages jsonb not null default '[]',
  visitor jsonb,
  message_count int not null default 0,
  duration_sec int,
  lead_captured boolean not null default false
);
create index dialogs_bot_id_started_at_idx on dialogs(bot_id, started_at desc);

create table leads (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  dialog_id uuid references dialogs(id) on delete set null,
  name text,
  email text,
  phone text,
  captured_at timestamptz not null default now(),
  note text
);
create index leads_bot_id_captured_at_idx on leads(bot_id, captured_at desc);

create table notification_settings (
  bot_id uuid primary key references bots(id) on delete cascade,
  email_on_new_lead boolean not null default false,
  notify_email text,
  webhook_url text
);
