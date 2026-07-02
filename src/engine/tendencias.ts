/**
 * Direção do mercado: séries 2021-2026 das edições da Pesquisa Código Fonte TV.
 * Alimenta a leitura de tendência ("para onde o mercado está indo") no resultado.
 */
import historico from '../data/historico.json'
import { round2 } from './impostos'
import type { Senioridade } from './benchmark'

export interface PontoSerie {
  ano: number
  valor: number
}

export interface Tendencias {
  serieClt: PontoSerie[]
  seriePj: PontoSerie[]
  /** Prêmio PJ sobre CLT por ano, em %. */
  seriePremioPj: PontoSerie[]
  /** Crescimento anual composto do CLT e do PJ no período, em %. */
  cagrClt: number
  cagrPj: number
  /** Série da senioridade escolhida (anos em que o nível foi publicado). */
  serieSenioridade: PontoSerie[]
  cagrSenioridade: number | null
}

function cagr(primeiro: PontoSerie, ultimo: PontoSerie): number {
  const anos = ultimo.ano - primeiro.ano
  return round2((Math.pow(ultimo.valor / primeiro.valor, 1 / anos) - 1) * 100)
}

export function calculaTendencias(senioridade: Senioridade): Tendencias {
  const edicoes = historico.edicoes

  const serieClt = edicoes.map((e) => ({ ano: e.ano, valor: e.vinculo.clt }))
  const seriePj = edicoes.map((e) => ({ ano: e.ano, valor: e.vinculo.pj }))
  const seriePremioPj = edicoes.map((e) => ({
    ano: e.ano,
    valor: round2((e.vinculo.pj / e.vinculo.clt - 1) * 100),
  }))

  const serieSenioridade = edicoes
    .filter((e) => e.senioridade[senioridade] != null)
    .map((e) => ({ ano: e.ano, valor: e.senioridade[senioridade] as number }))

  return {
    serieClt,
    seriePj,
    seriePremioPj,
    cagrClt: cagr(serieClt[0], serieClt[serieClt.length - 1]),
    cagrPj: cagr(seriePj[0], seriePj[seriePj.length - 1]),
    serieSenioridade,
    cagrSenioridade:
      serieSenioridade.length >= 2
        ? cagr(serieSenioridade[0], serieSenioridade[serieSenioridade.length - 1])
        : null,
  }
}
