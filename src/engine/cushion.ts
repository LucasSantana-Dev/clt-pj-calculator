/**
 * Colchão de segurança: camada visível e ajustável sobre a equivalência pura.
 * Cada item é nomeado, editável e explicado na UI; nada entra escondido.
 *
 * Modelo:
 * - Tempo não faturado (férias + inatividade entre contratos): quem quer manter
 *   o mesmo líquido anual trabalhando menos semanas precisa faturar
 *   52 / (52 − semanasParadas) por semana trabalhada.
 * - Custos que o CLT tinha de graça (plano de saúde, previdência): somam direto
 *   no faturamento mensal necessário.
 */
import { round2 } from './taxes'

export interface CushionInput {
  /** Semanas de férias por ano sem faturar. Padrão 4 (~30 dias). */
  vacationWeeks?: number
  /** Semanas estimadas paradas entre contratos por ano. Padrão 2. */
  idleWeeks?: number
  /** Plano de saúde mensal pago do próprio bolso. Padrão R$ 400. */
  monthlyHealthPlan?: number
  /** Aporte mensal de previdência para compensar FGTS/aposentadoria. Padrão R$ 0. */
  monthlyPension?: number
}

export interface CushionItem {
  key: 'vacation' | 'idle' | 'health-plan' | 'pension'
  label: string
  /** Acréscimo mensal em R$ sobre o faturamento equivalente. */
  monthlyAddition: number
}

export interface CushionResult {
  items: CushionItem[]
  totalMonthlyAddition: number
  /** Faturamento mensal recomendado (equivalência + colchão). */
  recommendedRevenue: number
  /** Percentual do colchão sobre a equivalência pura. */
  percentage: number
}

export const DEFAULT_CUSHION: Required<CushionInput> = {
  vacationWeeks: 4,
  idleWeeks: 2,
  monthlyHealthPlan: 400,
  monthlyPension: 0,
}

export function computeCushion(equivalentRevenue: number, input: CushionInput = {}): CushionResult {
  const cfg = { ...DEFAULT_CUSHION, ...input }

  const fatorFerias = 52 / (52 - cfg.vacationWeeks) - 1
  const fatorInatividade =
    52 / (52 - cfg.vacationWeeks - cfg.idleWeeks) - 52 / (52 - cfg.vacationWeeks)

  const items: CushionItem[] = [
    {
      key: 'vacation',
      label: 'Férias sem faturar',
      monthlyAddition: round2(equivalentRevenue * fatorFerias),
    },
    {
      key: 'idle',
      label: 'Períodos entre contratos',
      monthlyAddition: round2(equivalentRevenue * fatorInatividade),
    },
    {
      key: 'health-plan',
      label: 'Plano de saúde próprio',
      monthlyAddition: round2(cfg.monthlyHealthPlan),
    },
    {
      key: 'pension',
      label: 'Previdência complementar',
      monthlyAddition: round2(cfg.monthlyPension),
    },
  ]

  const totalMonthlyAddition = round2(items.reduce((s, i) => s + i.monthlyAddition, 0))
  const recommendedRevenue = round2(equivalentRevenue + totalMonthlyAddition)

  return {
    items,
    totalMonthlyAddition,
    recommendedRevenue,
    percentage: equivalentRevenue > 0 ? round2((totalMonthlyAddition / equivalentRevenue) * 100) : 0,
  }
}
