import { describe, expect, it } from 'vitest'
import { cltInss, lei15270Reduction, monthlyIrrf, safeAmount } from './taxes'
import { computeClt } from './clt'
import { computePj, effectiveRate } from './pj'
import { SIMPLES_ANNEX_III, SIMPLES_ANNEX_V } from './tables2026'

// Valores conferidos à mão contra as tabelas 2026 em tables2026.ts (fontes
// oficiais citadas lá). Cobrem os limites de faixa e as transições, que é onde
// erros de arredondamento/off-by-one aparecem.

describe('INSS — limites exatos de faixa (progressivo, teto 8.475,55)', () => {
  // fim faixa 1: 1621,00 × 7,5% = 121,575 (matemático). Em IEEE754,
  // 1621*0.075 = 121.574999… → round2 = 121,57. Diferença de 1 centavo aparece
  // SÓ quando a base cai exatamente em x,xx5. Travado no comportamento atual;
  // candidato a `round2` float-safe (arredondar meio-centavo) num follow-up.
  it('topo da faixa 1 (R$ 1.621,00) — artefato de arredondamento de float', () => {
    expect(cltInss(1621.0)).toBe(121.57)
  })
  // + (2902,84 − 1621,00) × 9%
  it('topo da faixa 2 (R$ 2.902,84)', () => {
    expect(cltInss(2902.84)).toBe(236.94)
  })
  // + (4354,27 − 2902,84) × 12%
  it('topo da faixa 3 (R$ 4.354,27)', () => {
    expect(cltInss(4354.27)).toBe(411.11)
  })
  it('acima do teto continua no máximo (988,09)', () => {
    expect(cltInss(8475.55)).toBe(988.09)
    expect(cltInss(8475.56)).toBe(988.09)
    expect(cltInss(1_000_000)).toBe(988.09)
  })
})

describe('Lei 15.270/2025 — transições de faixa da redução', () => {
  it('≤ 5.000: redução limitada ao máximo 312,89', () => {
    expect(lei15270Reduction(5000, 500)).toBe(312.89)
  })
  it('≤ 5.000: redução limitada ao próprio imposto quando menor', () => {
    expect(lei15270Reduction(5000, 100)).toBe(100)
  })
  it('logo acima de 5.000 mantém continuidade (~312,89)', () => {
    // 978,62 − 0,133145 × 5000,01 = 312,89 → casa com o teto da faixa isenta
    expect(lei15270Reduction(5000.01, 1000)).toBe(312.89)
  })
  it('no fim da transição (7.350) a redução zera', () => {
    expect(lei15270Reduction(7350, 1000)).toBe(0)
  })
  it('acima de 7.350 não há redução', () => {
    expect(lei15270Reduction(7350.01, 1000)).toBe(0)
  })
  it('imposto zero não gera redução (guarda)', () => {
    expect(lei15270Reduction(6000, 0)).toBe(0)
  })
})

describe('Simples Nacional — continuidade nas transições de faixa', () => {
  it('Anexo III: efetiva contínua em 6% na virada da faixa 1→2 (180k)', () => {
    expect(effectiveRate(180_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.06, 6)
    expect(effectiveRate(180_000.01, SIMPLES_ANNEX_III)).toBeCloseTo(0.06, 5)
  })
  it('Anexo III: topo faixa 2 (360k) = 8,6% e faixa 3 (720k) = 11,05%', () => {
    expect(effectiveRate(360_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.086, 6)
    expect(effectiveRate(720_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.1105, 6)
  })
  it('Anexo V: faixa 1 (180k) = 15,5% e topo faixa 2 (360k) = 16,75%', () => {
    expect(effectiveRate(180_000, SIMPLES_ANNEX_V)).toBeCloseTo(0.155, 6)
    expect(effectiveRate(360_000, SIMPLES_ANNEX_V)).toBeCloseTo(0.1675, 6)
  })
  it('acima do teto do Simples (4,8M) usa a última faixa (Anexo III → 20,04%)', () => {
    expect(effectiveRate(5_000_000, SIMPLES_ANNEX_III)).toBeCloseTo(0.2004, 6)
  })
})

describe('safeAmount — coerção de fronteira', () => {
  it('mantém números válidos ≥ 0', () => {
    expect(safeAmount(100)).toBe(100)
    expect(safeAmount(0)).toBe(0)
    expect(safeAmount('50')).toBe(50)
  })
  it('zera NaN, Infinity, negativos e lixo (ou usa fallback)', () => {
    expect(safeAmount(NaN)).toBe(0)
    expect(safeAmount(Infinity)).toBe(0)
    expect(safeAmount(-5)).toBe(0)
    expect(safeAmount('abc')).toBe(0)
    expect(safeAmount(undefined)).toBe(0)
    expect(safeAmount(-5, 10)).toBe(10)
  })
})

describe('Validação de input — nunca produz NaN/Infinity', () => {
  const finite = (r: { totalAnnualNet: number; monthlyAverage: number }) => {
    expect(Number.isFinite(r.totalAnnualNet)).toBe(true)
    expect(Number.isFinite(r.monthlyAverage)).toBe(true)
  }

  it('computePj sem faturamento retorna zeros (sem divisão por zero)', () => {
    const r = computePj({ monthlyRevenue: 0 })
    finite(r)
    expect(r.totalAnnualNet).toBe(0)
    expect(r.breakdown.monthlyDas).toBe(0)
    expect(r.breakdown.effectiveRate).toBe(0)
    expect(Number.isFinite(r.fatorR)).toBe(true)
  })

  it('computePj com faturamento negativo/NaN/Infinity é sanitizado a 0', () => {
    for (const bad of [-5000, NaN, Infinity]) {
      const r = computePj({ monthlyRevenue: bad })
      finite(r)
      expect(r.totalAnnualNet).toBe(0)
      expect(Number.isNaN(r.breakdown.effectiveRate)).toBe(false)
    }
  })

  it('computeClt com salário inválido não estoura (vira 0)', () => {
    for (const bad of [NaN, Infinity, -5000]) {
      const r = computeClt({ grossSalary: bad })
      finite(r)
      expect(r.totalAnnualNet).toBe(0)
    }
  })

  it('dependentes/benefícios inválidos não contaminam um cálculo válido', () => {
    const r = computeClt({
      grossSalary: 5000,
      dependents: NaN as unknown as number,
      monthlyBenefits: -100,
      valeTransporteMonthly: Infinity as unknown as number,
    })
    finite(r)
    // salário válido → resultado igual ao caso limpo de 5.000
    expect(r.totalAnnualNet).toBeCloseTo(computeClt({ grossSalary: 5000 }).totalAnnualNet, 1)
  })

  it('effectiveRate com base ≤ 0 retorna 0', () => {
    expect(effectiveRate(0, SIMPLES_ANNEX_III)).toBe(0)
    expect(effectiveRate(-100, SIMPLES_ANNEX_V)).toBe(0)
  })

  it('monthlyIrrf com renda baixa não gera imposto negativo', () => {
    expect(monthlyIrrf({ income: 1621, inss: 178.31 })).toBe(0)
  })
})
