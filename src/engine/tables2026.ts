/**
 * Parâmetros fiscais 2026 (Brasil).
 *
 * Fontes oficiais:
 * - Salário mínimo: Decreto nº 12.797/2025 (R$ 1.621,00 desde 2026-01-01)
 * - INSS: Portaria Interministerial MPS/MF nº 13/2026 — teto R$ 8.475,55
 * - IRRF: gov.br/receitafederal (tabelas 2026); Lei nº 15.270/2025 (redução até R$ 5.000)
 * - Simples Nacional: LC 123/2006, com redação da LC 155/2016 (Anexos III e V)
 */

export const SALARIO_MINIMO = 1621.0

export const INSS_TETO = 8475.55

/** Faixas progressivas INSS empregado (CLT), 2026. */
export const INSS_FAIXAS = [
  { ate: 1621.0, aliquota: 0.075 },
  { ate: 2902.84, aliquota: 0.09 },
  { ate: 4354.27, aliquota: 0.12 },
  { ate: 8475.55, aliquota: 0.14 },
] as const

/** Tabela mensal IRRF 2026: alíquota + parcela a deduzir sobre a base de cálculo. */
export const IRRF_FAIXAS = [
  { ate: 2428.8, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
] as const

/** Desconto simplificado mensal (alternativa às deduções legais). */
export const IRRF_DESCONTO_SIMPLIFICADO = 607.2

/** Dedução mensal por dependente. */
export const IRRF_DEDUCAO_DEPENDENTE = 189.59

/**
 * Lei 15.270/2025: redução mensal do IRRF para rendimentos até R$ 5.000
 * (isenção efetiva) com faixa de transição decrescente acima disso.
 * Valores máximos; a mecânica exata da transição fica em `reducaoLei15270`.
 */
export const LEI_15270_LIMITE_ISENCAO = 5000.0
export const LEI_15270_REDUCAO_MAX = 312.89

/** FGTS: depósito patronal mensal sobre remuneração (não descontado do empregado). */
export const FGTS_ALIQUOTA = 0.08

export interface FaixaSimples {
  rbt12Ate: number
  aliquotaNominal: number
  parcelaDeduzir: number
}

/** Simples Nacional — Anexo III (serviços; destino com fator R ≥ 28%). */
export const SIMPLES_ANEXO_III: FaixaSimples[] = [
  { rbt12Ate: 180_000, aliquotaNominal: 0.06, parcelaDeduzir: 0 },
  { rbt12Ate: 360_000, aliquotaNominal: 0.112, parcelaDeduzir: 9_360 },
  { rbt12Ate: 720_000, aliquotaNominal: 0.135, parcelaDeduzir: 17_640 },
  { rbt12Ate: 1_800_000, aliquotaNominal: 0.16, parcelaDeduzir: 35_640 },
  { rbt12Ate: 3_600_000, aliquotaNominal: 0.21, parcelaDeduzir: 125_640 },
  { rbt12Ate: 4_800_000, aliquotaNominal: 0.33, parcelaDeduzir: 648_000 },
]

/** Simples Nacional — Anexo V (serviços intelectuais/TI; fator R < 28%). */
export const SIMPLES_ANEXO_V: FaixaSimples[] = [
  { rbt12Ate: 180_000, aliquotaNominal: 0.155, parcelaDeduzir: 0 },
  { rbt12Ate: 360_000, aliquotaNominal: 0.18, parcelaDeduzir: 4_500 },
  { rbt12Ate: 720_000, aliquotaNominal: 0.195, parcelaDeduzir: 9_900 },
  { rbt12Ate: 1_800_000, aliquotaNominal: 0.205, parcelaDeduzir: 17_100 },
  { rbt12Ate: 3_600_000, aliquotaNominal: 0.23, parcelaDeduzir: 62_100 },
  { rbt12Ate: 4_800_000, aliquotaNominal: 0.305, parcelaDeduzir: 540_000 },
]

/** Fator R: folha de salários (12m, incl. pró-labore e encargos) / RBT12. */
export const FATOR_R_LIMIAR = 0.28

/** INSS do contribuinte individual (pró-labore em empresa do Simples). */
export const INSS_PRO_LABORE_ALIQUOTA = 0.11

/** Custo mensal típico de contador para PJ de um dev solo (fontes secundárias 2026). */
export const CONTADOR_MENSAL_PADRAO = 300.0
