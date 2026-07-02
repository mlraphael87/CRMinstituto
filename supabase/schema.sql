-- =========================================================================
-- IMOUVIR · CRM — schema do banco (Supabase / Postgres)
-- Execute este arquivo completo no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new)
-- =========================================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------------
-- Perfis de usuário (equipe que faz login no CRM)
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  cargo text not null default 'Atendente',
  created_at timestamptz not null default now()
);

-- Cria automaticamente um perfil quando um novo usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------------
-- Unidades
-- -------------------------------------------------------------------------
create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  codigo text not null default '',
  cidade text not null,
  uf text not null default '',
  endereco text not null default '',
  telefone text not null default '',
  sede boolean not null default false,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- Catálogo de aparelhos/acessórios
-- -------------------------------------------------------------------------
create table if not exists public.catalogo (
  id uuid primary key default gen_random_uuid(),
  cat text not null default '',
  nome text not null,
  codigo text not null default '',
  preco numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- Pacientes
-- -------------------------------------------------------------------------
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null default '',
  cpf text not null default '',
  data_nascimento date,
  cidade text not null default '',
  uf text not null default '',
  endereco text not null default '',
  status text not null default 'Novo Contato',
  fonoaudiologo text not null default '',
  observacoes text not null default '',
  created_at timestamptz not null default now()
);

-- Histórico (linha do tempo) de cada paciente
create table if not exists public.paciente_historico (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  data timestamptz not null default now(),
  texto text not null
);

-- Documentos anexados (o arquivo em si fica no Storage, bucket "documentos")
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  nome text not null,
  tipo text not null default 'Outro',
  tamanho bigint not null default 0,
  storage_path text not null,
  data_upload timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- Agendamentos
-- -------------------------------------------------------------------------
create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  unidade_id uuid references public.unidades (id) on delete set null,
  tipo text not null,
  data date not null,
  hora time not null,
  profissional text not null default '',
  status text not null default 'Agendado',
  confirmado_em timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- Pedidos
-- -------------------------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  id_fabrica text not null default '',
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  unidade_id uuid references public.unidades (id) on delete set null,
  endereco_entrega_custom text not null default '',
  condicao_pagamento text not null default '',
  fonoaudiologo text not null default '',
  status text not null default 'Aguardando Faturamento',
  nf_numero text,
  nf_data date,
  nf_fabricante text,
  criado_em timestamptz not null default now()
);

-- Itens do pedido (bonificacao = true para itens de bonificação)
create table if not exists public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  catalogo_id uuid references public.catalogo (id) on delete set null,
  nome text not null,
  codigo text not null default '',
  quantidade integer not null default 1,
  preco_unitario numeric(12, 2) not null default 0,
  bonificacao boolean not null default false
);

-- Números de série informados no faturamento
create table if not exists public.pedido_series (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  catalogo_id uuid references public.catalogo (id) on delete set null,
  nome text not null default '',
  numero_serie text not null default ''
);

-- -------------------------------------------------------------------------
-- Segurança (RLS) — qualquer usuário autenticado (equipe logada) pode
-- ler e escrever. Acesso anônimo é bloqueado.
-- -------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.unidades enable row level security;
alter table public.catalogo enable row level security;
alter table public.pacientes enable row level security;
alter table public.paciente_historico enable row level security;
alter table public.documentos enable row level security;
alter table public.agendamentos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.pedido_series enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update
  using (auth.uid() = id);

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'unidades', 'catalogo', 'pacientes', 'paciente_historico', 'documentos',
    'agendamentos', 'pedidos', 'pedido_itens', 'pedido_series'
  ])
  loop
    execute format(
      'drop policy if exists "%1$s_all_authenticated" on public.%1$s;', t
    );
    execute format(
      'create policy "%1$s_all_authenticated" on public.%1$s for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;

-- -------------------------------------------------------------------------
-- Storage — bucket privado para documentos dos pacientes
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists "documentos_bucket_authenticated" on storage.objects;
create policy "documentos_bucket_authenticated" on storage.objects for all
  using (bucket_id = 'documentos' and auth.role() = 'authenticated')
  with check (bucket_id = 'documentos' and auth.role() = 'authenticated');
