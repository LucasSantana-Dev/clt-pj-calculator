/**
 * Cálculos de INSS e IRRF mensais (2026), compartilhados por CLT e pró-labore.
 */
import {
  INSS_BRACKETS,
  INSS_CEILING,
  IRRF_BRACKETS,
  IRRF_SIMPLIFIED_DEDUCTION,
  IRRF_DEPENDENT_DEDUCTION,
  LEI_15270_MAX_REDUCTION,
} from './tables2026'

/** INSS progressivo do empregado CLT sobre o salário do mês (limitado ao teto). */
export function cltInss(remuneracao: number): number {
  const base = Math.min(remuneracao, INSS_CEILING)
  let total = 0
  let floorValue = 0
  for (const bracket of INSS_BRACKETS) {
    if (base <= floorValue) break
    const taxable = Math.min(base, bracket.ate) - floorValue
    total += taxable * bracket.aliquota
    floorValue = bracket.ate
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
export function lei15270Reduction(monthlyIncome: number, tableTax: number): number {
  if (tableTax <= 0) return 0
  if (monthlyIncome <= 5000) return Math.min(tableTax, LEI_15270_MAX_REDUCTION)
  if (monthlyIncome <= 7350) {
    const reduction = 978.62 - 0.133145 * monthlyIncome
    return Math.min(tableTax, Math.max(0, round2(reduction)))
  }
  return 0
}

export interface IrrfParams {
  /** Rendimento tributável bruto do mês (salário, férias+terço, 13º ou pró-labore). */
  income: number
  /** INSS retido sobre esse rendimento (dedução legal). */
  inss: number
  dependents?: number
  /**
   * Lei 15.270 vale para rendimentos do trabalho assalariado; sem orientação
   * oficial para pró-labore, aplicamos apenas no lado CLT (conservador).
   */
  applyLei15270?: boolean
}

/**
 * IRRF mensal: usa a dedução mais vantajosa entre as legais (INSS + dependentes)
 * e o desconto simplificado, como faz a fonte pagadora.
 */
export function monthlyIrrf({ income, inss, dependents = 0, applyLei15270 = false }: IrrfParams): number {
  const legalDeductions = inss + dependents * IRRF_DEPENDENT_DEDUCTION
  const deduction = Math.max(legalDeductions, IRRF_SIMPLIFIED_DEDUCTION)
  const base = Math.max(0, income - deduction)
  const bracket = IRRF_BRACKETS.find((f) => base <= f.ate)!
  const tableTax = Math.max(0, round2(base * bracket.aliquota - bracket.deduction))
  const reduction = applyLei15270 ? lei15270Reduction(income, tableTax) : 0
  return round2(Math.max(0, tableTax - reduction))
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/**
 * Coage uma entrada numérica a um número finito ≥ 0. Defesa na fronteira do
 * motor contra NaN, Infinity e negativos vindos da UI (input vazio/colado) ou
 * de qualquer caller futuro (ex.: API). Para entradas válidas é identidade, então
 * não altera nenhum cálculo fiscal existente.
 */
export function safeAmount(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}
