/**
 * Parâmetros fiscais 2026 (Brasil).
 *
 * Fontes oficiais:
 * - Salário mínimo: Decreto nº 12.797/2025 (R$ 1.621,00 desde 2026-01-01)
 * - INSS: Portaria Interministerial MPS/MF nº 13/2026 — teto R$ 8.475,55
 * - IRRF: gov.br/receitafederal (tabelas 2026); Lei nº 15.270/2025 (redução até R$ 5.000)
 * - Simples Nacional: LC 123/2006, com redação da LC 155/2016 (Anexos III e V)
 */

export const MINIMUM_WAGE = 1621.0

export const INSS_CEILING = 8475.55

/** Faixas progressivas INSS empregado (CLT), 2026. */
export const INSS_BRACKETS = [
  { ate: 1621.0, aliquota: 0.075 },
  { ate: 2902.84, aliquota: 0.09 },
  { ate: 4354.27, aliquota: 0.12 },
  { ate: 8475.55, aliquota: 0.14 },
] as const

/** Tabela mensal IRRF 2026: alíquota + parcela a deduzir sobre a base de cálculo. */
export const IRRF_BRACKETS = [
  { ate: 2428.8, aliquota: 0, deduction: 0 },
  { ate: 2826.65, aliquota: 0.075, deduction: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deduction: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deduction: 675.49 },
  { ate: Infinity, aliquota: 0.275, deduction: 908.73 },
] as const

/** Desconto simplificado mensal (alternativa às deduções legais). */
export const IRRF_SIMPLIFIED_DEDUCTION = 607.2

/** Dedução mensal por dependente. */
export const IRRF_DEPENDENT_DEDUCTION = 189.59

/**
 * Lei 15.270/2025: redução mensal do IRRF para rendimentos até R$ 5.000
 * (isenção efetiva) com faixa de transição decrescente acima disso.
 * Valores máximos; a mecânica exata da transição fica em `reducaoLei15270`.
 */
export const LEI_15270_EXEMPTION_LIMIT = 5000.0
export const LEI_15270_MAX_REDUCTION = 312.89

/** FGTS: depósito patronal mensal sobre remuneração (não descontado do empregado). */
export const FGTS_RATE = 0.08

export interface SimplesBracket {
  rbt12UpTo: number
  nominalRate: number
  deductionAmount: number
}

/** Simples Nacional — Anexo III (serviços; destino com fator R ≥ 28%). */
export const SIMPLES_ANNEX_III: SimplesBracket[] = [
  { rbt12UpTo: 180_000, nominalRate: 0.06, deductionAmount: 0 },
  { rbt12UpTo: 360_000, nominalRate: 0.112, deductionAmount: 9_360 },
  { rbt12UpTo: 720_000, nominalRate: 0.135, deductionAmount: 17_640 },
  { rbt12UpTo: 1_800_000, nominalRate: 0.16, deductionAmount: 35_640 },
  { rbt12UpTo: 3_600_000, nominalRate: 0.21, deductionAmount: 125_640 },
  { rbt12UpTo: 4_800_000, nominalRate: 0.33, deductionAmount: 648_000 },
]

/** Simples Nacional — Anexo V (serviços intelectuais/TI; fator R < 28%). */
export const SIMPLES_ANNEX_V: SimplesBracket[] = [
  { rbt12UpTo: 180_000, nominalRate: 0.155, deductionAmount: 0 },
  { rbt12UpTo: 360_000, nominalRate: 0.18, deductionAmount: 4_500 },
  { rbt12UpTo: 720_000, nominalRate: 0.195, deductionAmount: 9_900 },
  { rbt12UpTo: 1_800_000, nominalRate: 0.205, deductionAmount: 17_100 },
  { rbt12UpTo: 3_600_000, nominalRate: 0.23, deductionAmount: 62_100 },
  { rbt12UpTo: 4_800_000, nominalRate: 0.305, deductionAmount: 540_000 },
]

/** Fator R: folha de salários (12m, incl. pró-labore e encargos) / RBT12. */
export const FATOR_R_THRESHOLD = 0.28

/** INSS do contribuinte individual (pró-labore em empresa do Simples). */
export const INSS_PRO_LABORE_RATE = 0.11

/** Custo mensal típico de contador para PJ de um dev solo (fontes secundárias 2026). */
export const DEFAULT_MONTHLY_ACCOUNTANT = 300.0
