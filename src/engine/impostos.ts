/**
 * Cálculos de INSS e IRRF mensais (2026), compartilhados por CLT e pró-labore.
 */
import {
  INSS_FAIXAS,
  INSS_TETO,
  IRRF_FAIXAS,
  IRRF_DESCONTO_SIMPLIFICADO,
  IRRF_DEDUCAO_DEPENDENTE,
  LEI_15270_REDUCAO_MAX,
} from './tables2026'

/** INSS progressivo do empregado CLT sobre o salário do mês (limitado ao teto). */
export function inssClt(remuneracao: number): number {
  const base = Math.min(remuneracao, INSS_TETO)
  let total = 0
  let piso = 0
  for (const faixa of INSS_FAIXAS) {
    if (base <= piso) break
    const tributavel = Math.min(base, faixa.ate) - piso
    total += tributavel * faixa.aliquota
    piso = faixa.ate
  }
  return round2(total)
}

/**
 * Redução da Lei 15.270/2025 sobre o IRRF mensal.
 * - rendimento ≤ 5.000: redução = min(imposto, 312,89) → isenção efetiva
 * - 5.000,01 a 7.350: redução = 978,62 − 0,133145 × rendimento (limitada ao imposto)
 * - acima de 7.350: sem redução
 * Fonte: gov.br/receitafederal — Exemplos de Aplicação da Lei 15.270/2025.
 */
export function reducaoLei15270(rendimentoMensal: number, impostoTabela: number): number {
  if (impostoTabela <= 0) return 0
  if (rendimentoMensal <= 5000) return Math.min(impostoTabela, LEI_15270_REDUCAO_MAX)
  if (rendimentoMensal <= 7350) {
    const reducao = 978.62 - 0.133145 * rendimentoMensal
    return Math.min(impostoTabela, Math.max(0, round2(reducao)))
  }
  return 0
}

export interface IrrfParams {
  /** Rendimento tributável bruto do mês (salário, férias+terço, 13º ou pró-labore). */
  rendimento: number
  /** INSS retido sobre esse rendimento (dedução legal). */
  inss: number
  dependentes?: number
  /**
   * Lei 15.270 vale para rendimentos do trabalho assalariado; sem orientação
   * oficial para pró-labore, aplicamos apenas no lado CLT (conservador).
   */
  aplicarLei15270?: boolean
}

/**
 * IRRF mensal: usa a dedução mais vantajosa entre as legais (INSS + dependentes)
 * e o desconto simplificado, como faz a fonte pagadora.
 */
export function irrfMensal({ rendimento, inss, dependentes = 0, aplicarLei15270 = false }: IrrfParams): number {
  const deducoesLegais = inss + dependentes * IRRF_DEDUCAO_DEPENDENTE
  const deducao = Math.max(deducoesLegais, IRRF_DESCONTO_SIMPLIFICADO)
  const base = Math.max(0, rendimento - deducao)
  const faixa = IRRF_FAIXAS.find((f) => base <= f.ate)!
  const impostoTabela = Math.max(0, round2(base * faixa.aliquota - faixa.deducao))
  const reducao = aplicarLei15270 ? reducaoLei15270(rendimento, impostoTabela) : 0
  return round2(Math.max(0, impostoTabela - reducao))
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100
}
