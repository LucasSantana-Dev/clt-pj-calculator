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
import { FGTS_ALIQUOTA } from './tables2026'
import { inssClt, irrfMensal, round2 } from './impostos'

export interface CltInput {
  salarioBruto: number
  dependentes?: number
  /** Benefícios mensais não tributáveis (VR/VA, plano, home office, educação, etc.). */
  beneficiosMensais?: number
  /**
   * Custo mensal do vale-transporte pago pela empresa. Entra separado porque a
   * lei permite descontar do salário até 6% dele; o benefício líquido é só o
   * que passar disso: max(0, VT − 6% × salário).
   */
  valeTransporteMensal?: number
  /** PLR líquida anual estimada. */
  plrLiquidaAnual?: number
}

export interface CltBreakdown {
  liquidoMesNormal: number
  liquidoMesFerias: number
  liquido13: number
  fgtsAnual: number
  beneficiosAnuais: number
  plrLiquidaAnual: number
  inssMesNormal: number
  irrfMesNormal: number
}

export interface CltResult {
  liquidoAnualTotal: number
  mediaMensal: number
  breakdown: CltBreakdown
}

function liquidoPagamento(rendimento: number, dependentes: number): {
  liquido: number
  inss: number
  irrf: number
} {
  const inss = inssClt(rendimento)
  const irrf = irrfMensal({ rendimento, inss, dependentes, aplicarLei15270: true })
  return { liquido: round2(rendimento - inss - irrf), inss, irrf }
}

export function calculaClt(input: CltInput): CltResult {
  const {
    salarioBruto,
    dependentes = 0,
    beneficiosMensais = 0,
    valeTransporteMensal = 0,
    plrLiquidaAnual = 0,
  } = input
  const vtLiquidoMensal = Math.max(0, valeTransporteMensal - salarioBruto * 0.06)

  const mesNormal = liquidoPagamento(salarioBruto, dependentes)
  const mesFerias = liquidoPagamento(salarioBruto * (4 / 3), dependentes)
  const decimoTerceiro = liquidoPagamento(salarioBruto, dependentes)

  const fgtsAnual = round2(salarioBruto * (12 + 1 + 1 / 3) * FGTS_ALIQUOTA)
  const beneficiosAnuais = round2((beneficiosMensais + vtLiquidoMensal) * 12)

  const liquidoAnualTotal = round2(
    mesNormal.liquido * 11 +
      mesFerias.liquido +
      decimoTerceiro.liquido +
      fgtsAnual +
      beneficiosAnuais +
      plrLiquidaAnual,
  )

  return {
    liquidoAnualTotal,
    mediaMensal: round2(liquidoAnualTotal / 12),
    breakdown: {
      liquidoMesNormal: mesNormal.liquido,
      liquidoMesFerias: mesFerias.liquido,
      liquido13: decimoTerceiro.liquido,
      fgtsAnual,
      beneficiosAnuais,
      plrLiquidaAnual,
      inssMesNormal: mesNormal.inss,
      irrfMesNormal: mesNormal.irrf,
    },
  }
}
