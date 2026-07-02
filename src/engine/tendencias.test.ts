import { describe, expect, it } from 'vitest'
import { calculaTendencias } from './tendencias'

describe('Direção do mercado (2021-2026)', () => {
  it('prêmio PJ encolhe de ~45% (2021, pico 70% em 2022) para ~32% (2026)', () => {
    const t = calculaTendencias('pleno')
    const premio2022 = t.seriePremioPj.find((p) => p.ano === 2022)!.valor
    const premio2026 = t.seriePremioPj.find((p) => p.ano === 2026)!.valor
    expect(premio2022).toBeGreaterThan(65)
    expect(premio2026).toBeLessThan(35)
  })

  it('CAGR CLT supera CAGR PJ no período (CLT recuperando terreno)', () => {
    const t = calculaTendencias('pleno')
    expect(t.cagrClt).toBeGreaterThan(t.cagrPj)
    expect(t.cagrClt).toBeGreaterThan(10)
  })

  it('especialista só tem série a partir de 2024', () => {
    const t = calculaTendencias('especialista')
    expect(t.serieSenioridade[0].ano).toBe(2024)
    expect(t.cagrSenioridade).not.toBeNull()
  })
})
