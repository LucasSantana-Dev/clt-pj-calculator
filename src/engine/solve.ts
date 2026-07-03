/**
 * Conversões bidirecionais: busca binária pelo valor que iguala o líquido anual.
 */
import { computeClt, type CltInput, type CltResult } from './clt'
import { computePj, type PjInput, type PjResult } from './pj'
import { round2 } from './taxes'

export interface CltToPjEquivalence {
  clt: CltResult
  pj: PjResult
  /** Faturamento mensal PJ que empata o líquido anual do pacote CLT. */
  equivalentRevenue: number
}

export interface PjToCltEquivalence {
  pj: PjResult
  clt: CltResult
  /** Salário bruto CLT que empata o líquido anual do PJ. */
  equivalentSalary: number
}

function binarySearch(
  target: number,
  annualNetOf: (x: number) => number,
  initialUpperBound: number,
): number {
  let lo = 0
  let hi = initialUpperBound
  while (annualNetOf(hi) < target) {
    hi *= 2
    if (hi > 10_000_000) break
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (annualNetOf(mid) < target) lo = mid
    else hi = mid
  }
  return round2((lo + hi) / 2)
}

export function cltToPj(
  entry: CltInput,
  pjOptions: Omit<PjInput, 'monthlyRevenue'> = {},
): CltToPjEquivalence {
  const clt = computeClt(entry)
  const equivalentRevenue = binarySearch(
    clt.totalAnnualNet,
    (f) => computePj({ ...pjOptions, monthlyRevenue: f }).totalAnnualNet,
    entry.grossSalary * 2 + 1000,
  )
  const pj = computePj({ ...pjOptions, monthlyRevenue: equivalentRevenue })
  return { clt, pj, equivalentRevenue }
}

export function pjToClt(
  entry: PjInput,
  cltOptions: Omit<CltInput, 'grossSalary'> = {},
): PjToCltEquivalence {
  const pj = computePj(entry)
  const equivalentSalary = binarySearch(
    pj.totalAnnualNet,
    (s) => computeClt({ ...cltOptions, grossSalary: s }).totalAnnualNet,
    entry.monthlyRevenue * 2 + 1000,
  )
  const clt = computeClt({ ...cltOptions, grossSalary: equivalentSalary })
  return { pj, clt, equivalentSalary }
}
