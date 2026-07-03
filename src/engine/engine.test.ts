import { describe, expect, it } from 'vitest'
import { cltInss, monthlyIrrf, lei15270Reduction } from './taxes'
import { computeClt } from './clt'
import { effectiveRate, computePj } from './pj'
import { cltToPj, pjToClt } from './solve'
import { computeCushion } from './cushion'
import { SIMPLES_ANNEX_III, SIMPLES_ANNEX_V, INSS_CEILING } from './tables2026'

describe('INSS CLT 2026', () => {
  it('calcula progressivo em R$ 5.000', () => {
    expect(cltInss(5000)).toBe(501.51)
  })
  it('respeita o teto', () => {
    expect(cltInss(INSS_CEILING)).toBe(988.09)
    expect(cltInss(30000)).toBe(988.09)
  })
})

describe('IRRF 2026 + Lei 15.270', () => {
  it('isenta exatamente em R$ 5.000 (redução máxima 312,89)', () => {
    const inss = cltInss(5000)
    expect(monthlyIrrf({ income: 5000, inss, applyLei15270: true })).toBe(0)
  })
  it('aplica redução decrescente em R$ 6.000', () => {
    const inss = cltInss(6000)
    expect(inss).toBe(641.51)
    // tabela: base 5358,49 → 564,85; redução 978,62 − 0,133145×6000 = 179,75
    expect(monthlyIrrf({ income: 6000, inss, applyLei15270: true })).toBe(385.1)
  })
  it('sem redução acima de R$ 7.350', () => {
    expect(lei15270Reduction(8000, 1000)).toBe(0)
  })
  it('usa desconto simplificado quando melhor que deduções legais', () => {
    // pró-labore baixo: INSS 11% de 1621 = 178,31 < 607,20
    expect(monthlyIrrf({ income: 1621, inss: 178.31 })).toBe(0)
  })
})

describe('Pacote anual CLT', () => {
  it('soma 11 meses + férias 4/3 + 13º + FGTS', () => {
    const r = computeClt({ grossSalary: 5000 })
    expect(r.breakdown.normalMonthNet).toBe(4498.49)
    expect(r.breakdown.annualFgts).toBeCloseTo(5333.33, 1)
    expect(r.totalAnnualNet).toBeCloseTo(64615.5, 0)
  })
  it('vale-transporte desconta 6% do salário do benefício', () => {
    const sem = computeClt({ grossSalary: 5000 })
    // VT de 500 com desconto de 6% × 5000 = 300 → líquido 200/mês = 2400/ano
    const com = computeClt({ grossSalary: 5000, valeTransporteMonthly: 500 })
    expect(com.totalAnnualNet).toBeCloseTo(sem.totalAnnualNet + 2400, 1)
    // VT abaixo do desconto → benefício líquido zero
    const pequeno = computeClt({ grossSalary: 5000, valeTransporteMonthly: 250 })
    expect(pequeno.totalAnnualNet).toBeCloseTo(sem.totalAnnualNet, 1)
  })

  it('inclui benefícios e PLR', () => {
    const sem = computeClt({ grossSalary: 5000 })
    const com = computeClt({ grossSalary: 5000, monthlyBenefits: 1000, annualNetPlr: 5000 })
    expect(com.totalAnnualNet).toBeCloseTo(sem.totalAnnualNet + 17000, 1)
  })
})

describe('Simples Nacional', () => {
  it('alíquota efetiva faixa 1', () => {
    expect(effectiveRate(120_000, SIMPLES_ANNEX_V)).toBeCloseTo(0.155, 6)
    expect(effectiveRate(120_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.06, 6)
  })
  it('alíquota efetiva faixa 2 do Anexo III', () => {
    expect(effectiveRate(240_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.073, 6)
  })
})

describe('PJ com otimização de fator R', () => {
  it('escolhe pró-labore 28% + Anexo III quando compensa (F=10k)', () => {
    const r = computePj({ monthlyRevenue: 10_000, monthlyAccountant: 300 })
    expect(r.strategy).toBe('fator-r-28')
    expect(r.annex).toBe('III')
    expect(r.proLabore).toBe(2800)
    expect(r.breakdown.monthlyDas).toBe(600)
    expect(r.monthlyAverage).toBe(8792)
  })
  it('cenário customizado respeita o pró-labore informado', () => {
    const r = computePj({ monthlyRevenue: 10_000, customProLabore: 1621, monthlyAccountant: 300 })
    expect(r.strategy).toBe('custom')
    expect(r.annex).toBe('V')
    expect(r.monthlyAverage).toBe(7971.69)
  })
})

describe('Equivalência bidirecional', () => {
  it('CLT→PJ empata o líquido anual', () => {
    const { clt, pj } = cltToPj({ grossSalary: 8000 })
    expect(Math.abs(pj.totalAnnualNet - clt.totalAnnualNet)).toBeLessThan(5)
  })
  it('PJ→CLT empata o líquido anual', () => {
    const { pj, clt } = pjToClt({ monthlyRevenue: 15_000 })
    expect(Math.abs(clt.totalAnnualNet - pj.totalAnnualNet)).toBeLessThan(5)
  })
  it('roundtrip aproximado CLT→PJ→CLT', () => {
    const ida = cltToPj({ grossSalary: 10_000 })
    const volta = pjToClt({ monthlyRevenue: ida.equivalentRevenue })
    expect(volta.equivalentSalary).toBeCloseTo(10_000, -1)
  })
})

describe('Colchão de segurança', () => {
  it('itens padrão somam ~17% sobre equivalência de 10k', () => {
    const r = computeCushion(10_000)
    expect(r.items.find((i) => i.key === 'vacation')?.monthlyAddition).toBeCloseTo(833.33, 1)
    expect(r.recommendedRevenue).toBeCloseTo(11_704.34, 0)
    expect(r.percentage).toBeGreaterThan(15)
    expect(r.percentage).toBeLessThan(20)
  })
})
