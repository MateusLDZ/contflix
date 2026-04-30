create or replace view vw_clientes_por_quadrante as
with financeiro_mes as (
  select
    fc.cliente_id,
    fc.mes_referencia,
    coalesce(fc.receita, 0)::numeric as receita,
    coalesce(fc.custo, 0)::numeric as custo,
    (coalesce(fc.receita, 0) - coalesce(fc.custo, 0))::numeric as lucro,
    case
      when coalesce(fc.receita, 0) > 0 then ((coalesce(fc.receita, 0) - coalesce(fc.custo, 0)) / fc.receita)::numeric
      else 0::numeric
    end as margem
  from financeiro_clientes fc
),
esforco_mes as (
  select
    ac.cliente_id,
    ac.mes_referencia,
    coalesce(sum(ac.horas_alocadas), 0)::numeric as esforco_horas
  from alocacoes_clientes ac
  group by ac.cliente_id, ac.mes_referencia
),
clientes_classificados as (
  select
    fm.cliente_id,
    fm.mes_referencia,
    fm.receita,
    fm.custo,
    fm.lucro,
    fm.margem,
    coalesce(em.esforco_horas, 0)::numeric as esforco_horas,
    case
      when fm.lucro < 0 then 'prejuizo'
      when fm.margem >= 0.4 and coalesce(em.esforco_horas, 0) <= 10 then 'alta_margem_baixo_esforco'
      when fm.margem >= 0.4 and coalesce(em.esforco_horas, 0) > 10 then 'alta_margem_alto_esforco'
      when fm.margem < 0.4 and coalesce(em.esforco_horas, 0) <= 10 then 'baixa_margem_baixo_esforco'
      when fm.margem < 0.4 and coalesce(em.esforco_horas, 0) > 10 then 'baixa_margem_alto_esforco'
      else 'sem_quadrante'
    end as quadrante
  from financeiro_mes fm
  left join esforco_mes em
    on em.cliente_id = fm.cliente_id
   and em.mes_referencia = fm.mes_referencia
),
quadrantes_fixos as (
  select unnest(array[
    'alta_margem_baixo_esforco',
    'alta_margem_alto_esforco',
    'baixa_margem_baixo_esforco',
    'baixa_margem_alto_esforco',
    'prejuizo',
    'sem_quadrante'
  ]) as quadrante
),
agregado as (
  select
    cc.quadrante,
    count(distinct cc.cliente_id)::bigint as total_clientes,
    coalesce(sum(cc.receita), 0)::numeric(12,2) as receita_total,
    coalesce(sum(cc.custo), 0)::numeric(12,2) as custo_total,
    coalesce(sum(cc.lucro), 0)::numeric(12,2) as lucro_total,
    coalesce(avg(cc.margem), 0)::numeric(8,4) as margem_media
  from clientes_classificados cc
  group by cc.quadrante
)
select
  qf.quadrante,
  coalesce(a.total_clientes, 0)::bigint as total_clientes,
  coalesce(a.receita_total, 0)::numeric(12,2) as receita_total,
  coalesce(a.custo_total, 0)::numeric(12,2) as custo_total,
  coalesce(a.lucro_total, 0)::numeric(12,2) as lucro_total,
  coalesce(a.margem_media, 0)::numeric(8,4) as margem_media
from quadrantes_fixos qf
left join agregado a on a.quadrante = qf.quadrante;
