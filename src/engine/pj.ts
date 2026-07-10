/**
 * Lado PJ: Simples Nacional (Anexos III e V) com otimização automática de fator R.
 *
 * Modelo (dev solo, regime estável):
 * - RBT12 = 12 × faturamento mensal.
 * - DAS mensal = alíquota efetiva × faturamento; alíquota efetiva =
 *   (RBT12 × nominal − parcela a deduzir) / RBT12.
 * - Fator R = folha 12m / RBT12; folha = 12 × pró-labore (sem 13º de pró-labore).
 *   Fator R ≥ 28% → Anexo III; senão Anexo V.
 * - Sem CPP separada nos Anexos III e V (embutida no DAS).
 * - Pró-labore: INSS contribuinte individual 11% (até o teto) + IRRF pela tabela
 *   mensal, sem redução da Lei 15.270 (sem orientação oficial; conservador).
 * - Lucros distribuídos são isentos na PF.
 * - Líquido anual da pessoa = 12 × (faturamento − DAS − contador − INSS_pl − IRRF_pl).
 *
 * Estratégias comparadas automaticamente:
 * A) pró-labore mínimo (salário mínimo) — anexo decidido pelo fator R resultante;
 * B) pró-labore em 28% do faturamento — força Anexo III.
 * Vence a de maior líquido anual; pró-labore customizado desativa a otimização.
 */
import {
  FATOR_R_THRESHOLD,
  INSS_PRO_LABORE_RATE,
  INSS_CEILING,
  MINIMUM_WAGE,
  SIMPLES_ANNEX_III,
  SIMPLES_ANNEX_V,
  DEFAULT_MONTHLY_ACCOUNTANT,
  type SimplesBracket,
} from './tables2026'
import { monthlyIrrf, round2, safeAmount } from './taxes'

export type Annex = 'III' | 'V'

export interface PjInput {
  monthlyRevenue: number
  /** Pró-labore mensal customizado; se ausente, o motor otimiza. */
  customProLabore?: number
  monthlyAccountant?: number
  dependents?: number
}

export interface PjResult {
  totalAnnualNet: number
  monthlyAverage: number
  annex: Annex
  fatorR: number
  proLabore: number
  strategy: 'min-pro-labore' | 'fator-r-28' | 'custom'
  breakdown: {
    monthlyDas: number
    effectiveRate: number
    proLaboreInss: number
    proLaboreIrrf: number
    monthlyAccountant: number
    monthlyDistributedProfits: number
  }
}

export function effectiveRate(rbt12: number, tabela: SimplesBracket[]): number {
  if (rbt12 <= 0) return 0 // sem faturamento não há DAS; evita divisão por zero
  const bracket = tabela.find((f) => rbt12 <= f.rbt12UpTo) ?? tabela[tabela.length - 1]
  return (rbt12 * bracket.nominalRate - bracket.deductionAmount) / rbt12
}

function evaluateScenario(
  monthlyRevenue: number,
  proLabore: number,
  monthlyAccountant: number,
  dependents: number,
): Omit<PjResult, 'strategy'> {
  const rbt12 = monthlyRevenue * 12
  const payroll12m = proLabore * 12
  const fatorR = payroll12m / rbt12
  const annex: Annex = fatorR >= FATOR_R_THRESHOLD ? 'III' : 'V'
  const tabela = annex === 'III' ? SIMPLES_ANNEX_III : SIMPLES_ANNEX_V

  const efetiva = effectiveRate(rbt12, tabela)
  const monthlyDas = round2(monthlyRevenue * efetiva)

  const proLaboreInss = round2(Math.min(proLabore, INSS_CEILING) * INSS_PRO_LABORE_RATE)
  const proLaboreIrrf = monthlyIrrf({
    income: proLabore,
    inss: proLaboreInss,
    dependents,
    applyLei15270: false,
  })

  const liquidoMensal = monthlyRevenue - monthlyDas - monthlyAccountant - proLaboreInss - proLaboreIrrf
  const totalAnnualNet = round2(liquidoMensal * 12)

  return {
    totalAnnualNet,
    monthlyAverage: round2(liquidoMensal),
    annex,
    fatorR,
    proLabore,
    breakdown: {
      monthlyDas,
      effectiveRate: efetiva,
      proLaboreInss,
      proLaboreIrrf,
      monthlyAccountant,
      monthlyDistributedProfits: round2(monthlyRevenue - monthlyDas - monthlyAccountant - proLabore),
    },
  }
}

export function computePj(input: PjInput): PjResult {
  // Sanitiza na fronteira (NaN/Infinity/negativo → 0), protege todo caller.
  const monthlyRevenue = safeAmount(input.monthlyRevenue)
  const customProLabore = input.customProLabore === undefined ? undefined : safeAmount(input.customProLabore)
  const monthlyAccountant =
    input.monthlyAccountant === undefined ? DEFAULT_MONTHLY_ACCOUNTANT : safeAmount(input.monthlyAccountant)
  const dependents = Math.floor(safeAmount(input.dependents))

  // Sem faturamento: não há PJ a calcular. Retorno zerado evita rbt12=0 →
  // fator R 0/0 = NaN e divisão por zero no DAS.
  if (monthlyRevenue <= 0) {
    return {
      totalAnnualNet: 0,
      monthlyAverage: 0,
      annex: 'V',
      fatorR: 0,
      proLabore: 0,
      strategy: customProLabore !== undefined ? 'custom' : 'min-pro-labore',
      breakdown: {
        monthlyDas: 0,
        effectiveRate: 0,
        proLaboreInss: 0,
        proLaboreIrrf: 0,
        monthlyAccountant,
        monthlyDistributedProfits: 0,
      },
    }
  }

  if (customProLabore !== undefined) {
    return {
      ...evaluateScenario(monthlyRevenue, customProLabore, monthlyAccountant, dependents),
      strategy: 'custom',
    }
  }

  const minimo = evaluateScenario(monthlyRevenue, MINIMUM_WAGE, monthlyAccountant, dependents)
  // Arredonda o pró-labore para cima (centavo) para garantir fator R ≥ 28%;
  // arredondar para baixo derrubaria o cenário para o Anexo V por 0,000001.
  const proLabore28 = Math.ceil((monthlyRevenue * FATOR_R_THRESHOLD - 1e-9) * 100) / 100
  const fatorR28 = evaluateScenario(
    monthlyRevenue,
    Math.max(MINIMUM_WAGE, proLabore28),
    monthlyAccountant,
    dependents,
  )

  return minimo.totalAnnualNet >= fatorR28.totalAnnualNet
    ? { ...minimo, strategy: 'min-pro-labore' }
    : { ...fatorR28, strategy: 'fator-r-28' }
}
