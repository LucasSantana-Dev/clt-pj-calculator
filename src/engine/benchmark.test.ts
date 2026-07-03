import { describe, expect, it } from 'vitest'
import { computeBenchmark, nationalAverage } from './benchmark'

describe('Camada de Benchmark', () => {
  it('média nacional ponderada fica na ordem de grandeza publicada', () => {
    const n = nationalAverage()
    expect(n).toBeGreaterThan(10_000)
    expect(n).toBeLessThan(11_500)
  })

  it('pleno back-end SP CLT gera faixa plausível e fatores expostos', () => {
    const r = computeBenchmark(9000, {
      seniority: 'pleno',
      area: 'backend',
      uf: 'SP',
      contractType: 'clt',
      experience: '4-6',
      workMode: 'remoto',
    })
    expect(r.centralEstimate).toBeGreaterThan(7000)
    expect(r.centralEstimate).toBeLessThan(11_000)
    expect(r.rangeMin).toBeLessThan(r.centralEstimate)
    expect(r.rangeMax).toBeGreaterThan(r.centralEstimate)
    expect(r.factors).toHaveLength(4)
    expect(r.context).toHaveLength(2)
  })

  it('PJ desloca a faixa para cima em relação a CLT', () => {
    const clt = computeBenchmark(10_000, { seniority: 'senior', area: 'backend', uf: 'SP', contractType: 'clt' })
    const pj = computeBenchmark(10_000, { seniority: 'senior', area: 'backend', uf: 'SP', contractType: 'pj' })
    expect(pj.centralEstimate).toBeGreaterThan(clt.centralEstimate)
  })

  it('classifica posição abaixo/dentro/acima', () => {
    const profile = { seniority: 'junior', area: 'frontend', uf: 'MG', contractType: 'clt' } as const
    const ref = computeBenchmark(0, profile)
    expect(computeBenchmark(ref.rangeMin - 500, profile).position).toBe('below')
    expect(computeBenchmark(ref.centralEstimate, profile).position).toBe('within')
    expect(computeBenchmark(ref.rangeMax + 500, profile).position).toBe('above')
  })
})
