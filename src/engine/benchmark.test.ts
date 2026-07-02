import { describe, expect, it } from 'vitest'
import { calculaBenchmark, mediaNacionalGeral } from './benchmark'

describe('Camada de Benchmark', () => {
  it('média nacional ponderada fica na ordem de grandeza publicada', () => {
    const n = mediaNacionalGeral()
    expect(n).toBeGreaterThan(10_000)
    expect(n).toBeLessThan(11_500)
  })

  it('pleno back-end SP CLT gera faixa plausível e fatores expostos', () => {
    const r = calculaBenchmark(9000, {
      senioridade: 'pleno',
      area: 'backend',
      uf: 'SP',
      vinculo: 'clt',
      experiencia: '4-6',
      modalidade: 'remoto',
    })
    expect(r.estimativaCentral).toBeGreaterThan(7000)
    expect(r.estimativaCentral).toBeLessThan(11_000)
    expect(r.faixaMin).toBeLessThan(r.estimativaCentral)
    expect(r.faixaMax).toBeGreaterThan(r.estimativaCentral)
    expect(r.fatores).toHaveLength(4)
    expect(r.contexto).toHaveLength(2)
  })

  it('PJ desloca a faixa para cima em relação a CLT', () => {
    const clt = calculaBenchmark(10_000, { senioridade: 'senior', area: 'backend', uf: 'SP', vinculo: 'clt' })
    const pj = calculaBenchmark(10_000, { senioridade: 'senior', area: 'backend', uf: 'SP', vinculo: 'pj' })
    expect(pj.estimativaCentral).toBeGreaterThan(clt.estimativaCentral)
  })

  it('classifica posição abaixo/dentro/acima', () => {
    const perfil = { senioridade: 'junior', area: 'frontend', uf: 'MG', vinculo: 'clt' } as const
    const ref = calculaBenchmark(0, perfil)
    expect(calculaBenchmark(ref.faixaMin - 500, perfil).posicao).toBe('abaixo')
    expect(calculaBenchmark(ref.estimativaCentral, perfil).posicao).toBe('dentro')
    expect(calculaBenchmark(ref.faixaMax + 500, perfil).posicao).toBe('acima')
  })
})
