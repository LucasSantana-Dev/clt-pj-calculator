import { describe, expect, it } from 'vitest'
import { inssClt, irrfMensal, reducaoLei15270 } from './impostos'
import { calculaClt } from './clt'
import { aliquotaEfetiva, calculaPj } from './pj'
import { cltParaPj, pjParaClt } from './solve'
import { calculaColchao } from './colchao'
import { SIMPLES_ANEXO_III, SIMPLES_ANEXO_V, INSS_TETO } from './tables2026'

describe('INSS CLT 2026', () => {
  it('calcula progressivo em R$ 5.000', () => {
    expect(inssClt(5000)).toBe(501.51)
  })
  it('respeita o teto', () => {
    expect(inssClt(INSS_TETO)).toBe(988.09)
    expect(inssClt(30000)).toBe(988.09)
  })
})

describe('IRRF 2026 + Lei 15.270', () => {
  it('isenta exatamente em R$ 5.000 (redução máxima 312,89)', () => {
    const inss = inssClt(5000)
    expect(irrfMensal({ rendimento: 5000, inss, aplicarLei15270: true })).toBe(0)
  })
  it('aplica redução decrescente em R$ 6.000', () => {
    const inss = inssClt(6000)
    expect(inss).toBe(641.51)
    // tabela: base 5358,49 → 564,85; redução 978,62 − 0,133145×6000 = 179,75
    expect(irrfMensal({ rendimento: 6000, inss, aplicarLei15270: true })).toBe(385.1)
  })
  it('sem redução acima de R$ 7.350', () => {
    expect(reducaoLei15270(8000, 1000)).toBe(0)
  })
  it('usa desconto simplificado quando melhor que deduções legais', () => {
    // pró-labore baixo: INSS 11% de 1621 = 178,31 < 607,20
    expect(irrfMensal({ rendimento: 1621, inss: 178.31 })).toBe(0)
  })
})

describe('Pacote anual CLT', () => {
  it('soma 11 meses + férias 4/3 + 13º + FGTS', () => {
    const r = calculaClt({ salarioBruto: 5000 })
    expect(r.breakdown.liquidoMesNormal).toBe(4498.49)
    expect(r.breakdown.fgtsAnual).toBeCloseTo(5333.33, 1)
    expect(r.liquidoAnualTotal).toBeCloseTo(64615.5, 0)
  })
  it('inclui benefícios e PLR', () => {
    const sem = calculaClt({ salarioBruto: 5000 })
    const com = calculaClt({ salarioBruto: 5000, beneficiosMensais: 1000, plrLiquidaAnual: 5000 })
    expect(com.liquidoAnualTotal).toBeCloseTo(sem.liquidoAnualTotal + 17000, 1)
  })
})

describe('Simples Nacional', () => {
  it('alíquota efetiva faixa 1', () => {
    expect(aliquotaEfetiva(120_000, SIMPLES_ANEXO_V)).toBeCloseTo(0.155, 6)
    expect(aliquotaEfetiva(120_000, SIMPLES_ANEXO_III)).toBeCloseTo(0.06, 6)
  })
  it('alíquota efetiva faixa 2 do Anexo III', () => {
    expect(aliquotaEfetiva(240_000, SIMPLES_ANEXO_III)).toBeCloseTo(0.073, 6)
  })
})

describe('PJ com otimização de fator R', () => {
  it('escolhe pró-labore 28% + Anexo III quando compensa (F=10k)', () => {
    const r = calculaPj({ faturamentoMensal: 10_000, contadorMensal: 300 })
    expect(r.estrategia).toBe('fator-r-28')
    expect(r.anexo).toBe('III')
    expect(r.proLabore).toBe(2800)
    expect(r.breakdown.dasMensal).toBe(600)
    expect(r.mediaMensal).toBe(8792)
  })
  it('cenário customizado respeita o pró-labore informado', () => {
    const r = calculaPj({ faturamentoMensal: 10_000, proLaboreCustom: 1621, contadorMensal: 300 })
    expect(r.estrategia).toBe('customizado')
    expect(r.anexo).toBe('V')
    expect(r.mediaMensal).toBe(7971.69)
  })
})

describe('Equivalência bidirecional', () => {
  it('CLT→PJ empata o líquido anual', () => {
    const { clt, pj } = cltParaPj({ salarioBruto: 8000 })
    expect(Math.abs(pj.liquidoAnualTotal - clt.liquidoAnualTotal)).toBeLessThan(5)
  })
  it('PJ→CLT empata o líquido anual', () => {
    const { pj, clt } = pjParaClt({ faturamentoMensal: 15_000 })
    expect(Math.abs(clt.liquidoAnualTotal - pj.liquidoAnualTotal)).toBeLessThan(5)
  })
  it('roundtrip aproximado CLT→PJ→CLT', () => {
    const ida = cltParaPj({ salarioBruto: 10_000 })
    const volta = pjParaClt({ faturamentoMensal: ida.faturamentoEquivalente })
    expect(volta.salarioEquivalente).toBeCloseTo(10_000, -1)
  })
})

describe('Colchão de segurança', () => {
  it('itens padrão somam ~17% sobre equivalência de 10k', () => {
    const r = calculaColchao(10_000)
    expect(r.itens.find((i) => i.chave === 'ferias')?.acrescimoMensal).toBeCloseTo(833.33, 1)
    expect(r.faturamentoRecomendado).toBeCloseTo(11_704.34, 0)
    expect(r.percentual).toBeGreaterThan(15)
    expect(r.percentual).toBeLessThan(20)
  })
})
