/**
 * Pacote anual CLT: 11 meses normais + mês de férias (salário × 4/3) + 13º,
 * mais depósitos de FGTS e benefícios informados.
 *
 * Simplificações documentadas:
 * - Mês de férias modelado como um único pagamento de 4/3 do salário,
 *   tributado em conjunto (INSS + IRRF no mês).
 * - 13º tributado exclusivamente (INSS + IRRF próprios), com a redução da
 *   Lei 15.270 aplicada (orientação RFB dez/2025 para rendimentos mensais).
 * - PLR entra como valor líquido anual estimado pelo usuário (tabela própria
 *   de PLR fica fora da v1).
 * - FGTS: 8% sobre salário, 13º e férias+terço (≈ 13,33 salários/ano);
 *   conta como parte do pacote (patrimônio do trabalhador).
 */
import { FGTS_RATE } from './tables2026'
import { cltInss, monthlyIrrf, round2, safeAmount } from './taxes'

export interface CltInput {
  grossSalary: number
  dependents?: number
  /** Benefícios mensais não tributáveis (VR/VA, plano, home office, educação, etc.). */
  monthlyBenefits?: number
  /**
   * Custo mensal do vale-transporte pago pela empresa. Entra separado porque a
   * lei permite descontar do salário até 6% dele; o benefício líquido é só o
   * que passar disso: max(0, VT − 6% × salário).
   */
  valeTransporteMonthly?: number
  /** PLR líquida anual estimada. */
  annualNetPlr?: number
}

export interface CltBreakdown {
  normalMonthNet: number
  vacationMonthNet: number
  thirteenthNet: number
  annualFgts: number
  annualBenefits: number
  annualNetPlr: number
  normalMonthInss: number
  normalMonthIrrf: number
}

export interface CltResult {
  totalAnnualNet: number
  monthlyAverage: number
  breakdown: CltBreakdown
}

function liquidoPagamento(income: number, dependents: number): {
  liquido: number
  inss: number
  irrf: number
} {
  const inss = cltInss(income)
  const irrf = monthlyIrrf({ income, inss, dependents, applyLei15270: true })
  return { liquido: round2(income - inss - irrf), inss, irrf }
}

export function computeClt(input: CltInput): CltResult {
  // Sanitiza na fronteira: qualquer entrada não-finita/negativa vira 0 antes de
  // alimentar o cálculo fiscal (evita NaN/valores absurdos propagando).
  const grossSalary = safeAmount(input.grossSalary)
  const dependents = Math.floor(safeAmount(input.dependents))
  const monthlyBenefits = safeAmount(input.monthlyBenefits)
  const valeTransporteMonthly = safeAmount(input.valeTransporteMonthly)
  const annualNetPlr = safeAmount(input.annualNetPlr)
  const monthlyVtNet = Math.max(0, valeTransporteMonthly - grossSalary * 0.06)

  const mesNormal = liquidoPagamento(grossSalary, dependents)
  const mesFerias = liquidoPagamento(grossSalary * (4 / 3), dependents)
  const decimoTerceiro = liquidoPagamento(grossSalary, dependents)

  const annualFgts = round2(grossSalary * (12 + 1 + 1 / 3) * FGTS_RATE)
  const annualBenefits = round2((monthlyBenefits + monthlyVtNet) * 12)

  const totalAnnualNet = round2(
    mesNormal.liquido * 11 +
      mesFerias.liquido +
      decimoTerceiro.liquido +
      annualFgts +
      annualBenefits +
      annualNetPlr,
  )

  return {
    totalAnnualNet,
    monthlyAverage: round2(totalAnnualNet / 12),
    breakdown: {
      normalMonthNet: mesNormal.liquido,
      vacationMonthNet: mesFerias.liquido,
      thirteenthNet: decimoTerceiro.liquido,
      annualFgts,
      annualBenefits,
      annualNetPlr,
      normalMonthInss: mesNormal.inss,
      normalMonthIrrf: mesNormal.irrf,
    },
  }
}
