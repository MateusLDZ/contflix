create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  avatar_url text,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists times (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  created_at timestamptz not null default now()
);

insert into times (nome, slug)
values
  ('Diretoria', 'diretoria'),
  ('Administracao', 'administracao'),
  ('Societario', 'societario'),
  ('Fiscal', 'fiscal'),
  ('Contabil', 'contabil'),
  ('Folha', 'folha'),
  ('Comercial', 'comercial')
on conflict (slug) do nothing;

create table if not exists usuarios_times (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  time_id uuid not null references times(id) on delete cascade,
  cargo_no_time text,
  created_at timestamptz not null default now(),
  unique (usuario_id, time_id)
);

create table if not exists permissoes_times (
  id uuid primary key default gen_random_uuid(),
  time_id uuid not null references times(id) on delete cascade,
  modulo text not null,
  pode_visualizar boolean not null default false,
  pode_criar boolean not null default false,
  pode_editar boolean not null default false,
  pode_excluir boolean not null default false,
  created_at timestamptz not null default now(),
  unique (time_id, modulo),
  constraint permissoes_times_modulo_check check (
    modulo in (
      'painel_geral',
      'clientes',
      'fiscal',
      'contabil',
      'folha',
      'paralegal',
      'nfse',
      'gestao',
      'estrategico',
      'onboarding',
      'usuarios',
      'seguranca',
      'configuracoes',
      'relatorios',
      'auditoria'
    )
  )
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apelido text,
  documento text unique,
  regime_tributario text,
  segmento text,
  cidade text,
  uf char(2),
  mensalidade numeric(12,2) not null default 0,
  status text not null default 'ativo',
  data_entrada date,
  data_saida date,
  created_at timestamptz not null default now()
);

create table if not exists financeiro_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  mes_referencia date not null,
  receita numeric(12,2) not null default 0,
  custo numeric(12,2) not null default 0,
  lucro numeric(12,2) generated always as (receita - custo) stored,
  margem numeric(8,4) generated always as (
    case
      when receita > 0 then (receita - custo) / receita
      else 0
    end
  ) stored,
  quadrante text,
  created_at timestamptz not null default now(),
  unique (cliente_id, mes_referencia)
);

create table if not exists colaboradores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique,
  cargo text,
  time_id uuid references times(id) on delete set null,
  custo_mensal numeric(12,2) not null default 0,
  horas_produtivas_mes numeric(8,2) not null default 0,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists alocacoes_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  time_id uuid references times(id) on delete set null,
  mes_referencia date not null,
  horas_alocadas numeric(8,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists metricas_marketing (
  id uuid primary key default gen_random_uuid(),
  mes_referencia date not null unique,
  investimento numeric(12,2) not null default 0,
  leads integer not null default 0,
  oportunidades integer not null default 0,
  vendas integer not null default 0,
  receita_gerada numeric(12,2) not null default 0,
  cac numeric(12,2) generated always as (
    case
      when vendas > 0 then investimento / vendas
      else 0
    end
  ) stored,
  roi numeric(8,4) generated always as (
    case
      when investimento > 0 then (receita_gerada - investimento) / investimento
      else 0
    end
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_usuarios_status on usuarios(status);
create index if not exists idx_clientes_status on clientes(status);
create index if not exists idx_clientes_segmento on clientes(segmento);
create index if not exists idx_usuarios_times_usuario_id on usuarios_times(usuario_id);
create index if not exists idx_usuarios_times_time_id on usuarios_times(time_id);
create index if not exists idx_permissoes_times_time_id on permissoes_times(time_id);
create index if not exists idx_financeiro_clientes_cliente_id on financeiro_clientes(cliente_id);
create index if not exists idx_financeiro_clientes_mes_referencia on financeiro_clientes(mes_referencia);
create index if not exists idx_financeiro_clientes_quadrante on financeiro_clientes(quadrante);
create index if not exists idx_colaboradores_time_id on colaboradores(time_id);
create index if not exists idx_colaboradores_status on colaboradores(status);
create index if not exists idx_alocacoes_clientes_cliente_id on alocacoes_clientes(cliente_id);
create index if not exists idx_alocacoes_clientes_colaborador_id on alocacoes_clientes(colaborador_id);
create index if not exists idx_alocacoes_clientes_time_id on alocacoes_clientes(time_id);
create index if not exists idx_alocacoes_clientes_mes_referencia on alocacoes_clientes(mes_referencia);
create index if not exists idx_metricas_marketing_mes_referencia on metricas_marketing(mes_referencia);

create or replace view vw_dashboard_kpis as
with mes_atual as (
  select date_trunc('month', current_date)::date as mes
),
financeiro_mes as (
  select
    coalesce(sum(fc.receita), 0)::numeric(12,2) as receita_mensal_total,
    coalesce(sum(fc.custo), 0)::numeric(12,2) as custo_mensal_total,
    coalesce(sum(fc.lucro), 0)::numeric(12,2) as lucro_mensal_total,
    coalesce(avg(fc.margem), 0)::numeric(8,4) as margem_media
  from financeiro_clientes fc
  join mes_atual ma on fc.mes_referencia = ma.mes
),
marketing_mes as (
  select
    coalesce(mm.investimento, 0)::numeric(12,2) as investimento_marketing_mes,
    coalesce(mm.leads, 0)::integer as leads_mes,
    coalesce(mm.oportunidades, 0)::integer as oportunidades_mes,
    coalesce(mm.vendas, 0)::integer as vendas_mes,
    coalesce(mm.cac, 0)::numeric(12,2) as cac_mes,
    coalesce(mm.roi, 0)::numeric(8,4) as roi_mes
  from mes_atual ma
  left join metricas_marketing mm on mm.mes_referencia = ma.mes
)
select
  (select count(*)::bigint from clientes) as total_clientes,
  (select count(*)::bigint from clientes c where c.status = 'ativo') as clientes_ativos,
  fm.receita_mensal_total,
  fm.custo_mensal_total,
  fm.lucro_mensal_total,
  fm.margem_media,
  mk.investimento_marketing_mes,
  mk.leads_mes,
  mk.oportunidades_mes,
  mk.vendas_mes,
  mk.cac_mes,
  mk.roi_mes
from financeiro_mes fm
cross join marketing_mes mk;

create or replace view vw_top_clientes_rentaveis as
select
  c.id as cliente_id,
  c.nome,
  c.apelido,
  c.segmento,
  c.mensalidade,
  fc.receita,
  fc.custo,
  fc.lucro,
  fc.margem,
  fc.quadrante,
  fc.mes_referencia
from financeiro_clientes fc
join clientes c on c.id = fc.cliente_id
order by fc.lucro desc, fc.margem desc;

create or replace view vw_top_alertas_clientes as
select
  c.id as cliente_id,
  c.nome,
  c.apelido,
  c.segmento,
  fc.receita,
  fc.custo,
  fc.lucro,
  fc.margem,
  fc.quadrante,
  fc.mes_referencia
from financeiro_clientes fc
join clientes c on c.id = fc.cliente_id
where fc.margem <= 0.15
   or fc.lucro <= 0
   or fc.custo > fc.receita
order by fc.margem asc, fc.lucro asc;

create or replace view vw_clientes_por_quadrante as
select
  coalesce(fc.quadrante, 'sem_quadrante') as quadrante,
  count(distinct fc.cliente_id)::bigint as total_clientes,
  coalesce(sum(fc.receita), 0)::numeric(12,2) as receita_total,
  coalesce(sum(fc.custo), 0)::numeric(12,2) as custo_total,
  coalesce(sum(fc.lucro), 0)::numeric(12,2) as lucro_total,
  coalesce(avg(fc.margem), 0)::numeric(8,4) as margem_media
from financeiro_clientes fc
group by coalesce(fc.quadrante, 'sem_quadrante');

create or replace view vw_clientes_por_segmento as
select
  coalesce(c.segmento, 'sem_segmento') as segmento,
  count(distinct fc.cliente_id)::bigint as total_clientes,
  coalesce(sum(fc.receita), 0)::numeric(12,2) as receita_total,
  coalesce(sum(fc.custo), 0)::numeric(12,2) as custo_total,
  coalesce(sum(fc.lucro), 0)::numeric(12,2) as lucro_total,
  coalesce(avg(fc.margem), 0)::numeric(8,4) as margem_media
from financeiro_clientes fc
join clientes c on c.id = fc.cliente_id
group by coalesce(c.segmento, 'sem_segmento');

create or replace view vw_ocupacao_time as
select
  t.id as time_id,
  t.nome as time_nome,
  ac.mes_referencia,
  coalesce(sum(ac.horas_alocadas), 0)::numeric(12,2) as total_horas_alocadas,
  coalesce(sum(col.horas_produtivas_mes), 0)::numeric(12,2) as total_horas_disponiveis,
  case
    when coalesce(sum(col.horas_produtivas_mes), 0) > 0
      then (coalesce(sum(ac.horas_alocadas), 0) / coalesce(sum(col.horas_produtivas_mes), 0))::numeric(8,4)
    else 0::numeric(8,4)
  end as percentual_ocupacao
from alocacoes_clientes ac
join times t on t.id = ac.time_id
left join colaboradores col on col.id = ac.colaborador_id
group by t.id, t.nome, ac.mes_referencia;
