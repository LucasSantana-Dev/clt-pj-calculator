import { describe, expect, it } from 'vitest'
import { computeTrends } from './trends'

describe('Direção do mercado (2021-2026)', () => {
  it('prêmio PJ encolhe de ~45% (2021, pico 70% em 2022) para ~32% (2026)', () => {
    const t = computeTrends('pleno')
    const premio2022 = t.pjPremiumSeries.find((p) => p.year === 2022)!.value
    const premio2026 = t.pjPremiumSeries.find((p) => p.year === 2026)!.value
    expect(premio2022).toBeGreaterThan(65)
    expect(premio2026).toBeLessThan(35)
  })

  it('CAGR CLT supera CAGR PJ no período (CLT recuperando terreno)', () => {
    const t = computeTrends('pleno')
    expect(t.cltCagr).toBeGreaterThan(t.pjCagr)
    expect(t.cltCagr).toBeGreaterThan(10)
  })

  it('especialista só tem série a partir de 2024', () => {
    const t = computeTrends('especialista')
    expect(t.senioritySeries[0].year).toBe(2024)
    expect(t.seniorityCagr).not.toBeNull()
  })
})
