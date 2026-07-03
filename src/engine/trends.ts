/**
 * Direção do mercado: séries 2021-2026 das edições da Pesquisa Código Fonte TV.
 * Alimenta a leitura de tendência ("para onde o mercado está indo") no resultado.
 */
import history2021to2026 from '../data/history2021to2026.json'
import { round2 } from './taxes'
import type { Seniority } from './benchmark'

export interface SeriesPoint {
  year: number
  value: number
}

export interface Trends {
  cltSeries: SeriesPoint[]
  pjSeries: SeriesPoint[]
  /** Prêmio PJ sobre CLT por ano, em %. */
  pjPremiumSeries: SeriesPoint[]
  /** Crescimento anual composto do CLT e do PJ no período, em %. */
  cltCagr: number
  pjCagr: number
  /** Série da senioridade escolhida (anos em que o nível foi publicado). */
  senioritySeries: SeriesPoint[]
  seniorityCagr: number | null
}

function cagr(first: SeriesPoint, last: SeriesPoint): number {
  const years = last.year - first.year
  return round2((Math.pow(last.value / first.value, 1 / years) - 1) * 100)
}

export function computeTrends(seniority: Seniority): Trends {
  const editions = history2021to2026.editions

  const cltSeries = editions.map((e) => ({ year: e.year, value: e.contractType.clt }))
  const pjSeries = editions.map((e) => ({ year: e.year, value: e.contractType.pj }))
  const pjPremiumSeries = editions.map((e) => ({
    year: e.year,
    value: round2((e.contractType.pj / e.contractType.clt - 1) * 100),
  }))

  const senioritySeries = editions
    .filter((e) => e.seniority[seniority] != null)
    .map((e) => ({ year: e.year, value: e.seniority[seniority] as number }))

  return {
    cltSeries,
    pjSeries,
    pjPremiumSeries,
    cltCagr: cagr(cltSeries[0], cltSeries[cltSeries.length - 1]),
    pjCagr: cagr(pjSeries[0], pjSeries[pjSeries.length - 1]),
    senioritySeries,
    seniorityCagr:
      senioritySeries.length >= 2
        ? cagr(senioritySeries[0], senioritySeries[senioritySeries.length - 1])
        : null,
  }
}
