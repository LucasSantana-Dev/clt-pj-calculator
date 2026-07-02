/**
 * Camada de Benchmark: posiciona um valor bruto mensal contra o mercado tech BR.
 *
 * Modelo de fatores (ADR-0001, ajustado à realidade dos dados):
 * - Base: média nacional da senioridade (publicada pela pesquisa).
 * - Fatores multiplicativos: área × UF × vínculo (CLT/PJ), cada um derivado de
 *   média marginal / média nacional geral.
 * - Experiência e modalidade NÃO entram na multiplicação: experiência é
 *   colinear com senioridade (contaria duas vezes) e a pesquisa não publica
 *   corte salarial por modalidade. Ambas aparecem como contexto no
 *   "como calculamos".
 * - Resultado é sempre "faixa estimada" (±15% em torno da estimativa central),
 *   nunca dado observado do segmento conjunto.
 */
import dados from '../data/benchmark2026.json'
import { round2 } from './impostos'

export type Senioridade = keyof typeof dados.senioridade
export type Area = keyof typeof dados.area
export type Uf = keyof typeof dados.uf
export type Experiencia = keyof typeof dados.experiencia
export type Vinculo = 'clt' | 'pj'
export type Modalidade = 'remoto' | 'hibrido' | 'presencial'

const LARGURA_FAIXA = 0.15

export interface PerfilBenchmark {
  senioridade: Senioridade
  area: Area
  uf: Uf
  vinculo: Vinculo
  experiencia?: Experiencia
  modalidade?: Modalidade
}

export interface FatorExplicado {
  chave: 'base-senioridade' | 'area' | 'uf' | 'vinculo'
  rotulo: string
  valor: number
  referencia: number
}

export interface ContextoExplicado {
  rotulo: string
  texto: string
}

export type Posicao = 'abaixo' | 'dentro' | 'acima'

export interface BenchmarkResult {
  estimativaCentral: number
  faixaMin: number
  faixaMax: number
  posicao: Posicao
  valorComparado: number
  fatores: FatorExplicado[]
  contexto: ContextoExplicado[]
  mediaNacionalGeral: number
  fonte: typeof dados.meta
}

/** Média nacional geral: média das UFs ponderada pelo nº de respondentes. */
export function mediaNacionalGeral(): number {
  const ufs = Object.values(dados.uf)
  const somaPonderada = ufs.reduce((s, u) => s + u.media * u.n, 0)
  const n = ufs.reduce((s, u) => s + u.n, 0)
  return somaPonderada / n
}

const ROTULO_EXPERIENCIA: Record<Experiencia, string> = {
  'menos-1': 'menos de 1 ano',
  '1-2': '1 a 2 anos',
  '2-4': '2 a 4 anos',
  '4-6': '4 a 6 anos',
  '6-8': '6 a 8 anos',
  '8-10': '8 a 10 anos',
  '10-15': '10 a 15 anos',
  '15-20': '15 a 20 anos',
  'mais-20': 'mais de 20 anos',
}

export function calculaBenchmark(valorBrutoMensal: number, perfil: PerfilBenchmark): BenchmarkResult {
  const nacional = mediaNacionalGeral()

  const base = dados.senioridade[perfil.senioridade]
  const fatorArea = dados.area[perfil.area] / nacional
  const fatorUf = dados.uf[perfil.uf].media / nacional
  const fatorVinculo = dados.vinculo[perfil.vinculo] / nacional

  const estimativaCentral = round2(base * fatorArea * fatorUf * fatorVinculo)
  const faixaMin = round2(estimativaCentral * (1 - LARGURA_FAIXA))
  const faixaMax = round2(estimativaCentral * (1 + LARGURA_FAIXA))

  const posicao: Posicao =
    valorBrutoMensal < faixaMin ? 'abaixo' : valorBrutoMensal > faixaMax ? 'acima' : 'dentro'

  const fatores: FatorExplicado[] = [
    {
      chave: 'base-senioridade',
      rotulo: `Média nacional da senioridade`,
      valor: base,
      referencia: nacional,
    },
    { chave: 'area', rotulo: 'Ajuste pela área', valor: round4(fatorArea), referencia: dados.area[perfil.area] },
    { chave: 'uf', rotulo: 'Ajuste pela UF', valor: round4(fatorUf), referencia: dados.uf[perfil.uf].media },
    {
      chave: 'vinculo',
      rotulo: perfil.vinculo === 'pj' ? 'Ajuste para PJ' : 'Ajuste para CLT',
      valor: round4(fatorVinculo),
      referencia: dados.vinculo[perfil.vinculo],
    },
  ]

  const contexto: ContextoExplicado[] = []
  if (perfil.experiencia) {
    contexto.push({
      rotulo: 'Tempo de experiência',
      texto: `Quem tem ${ROTULO_EXPERIENCIA[perfil.experiencia]} de área recebe em média R$ ${dados.experiencia[perfil.experiencia].toLocaleString('pt-BR')}. Não multiplicamos esse fator porque ele já anda junto com a senioridade.`,
    })
  }
  if (perfil.modalidade) {
    contexto.push({
      rotulo: 'Modalidade',
      texto: `A pesquisa não publica salário por modalidade; ${dados.modalidadeDistribuicao.remoto.toLocaleString('pt-BR')}% do mercado trabalha remoto. Trabalho remoto costuma ampliar o leque de vagas e de faixas acessíveis.`,
    })
  }

  return {
    estimativaCentral,
    faixaMin,
    faixaMax,
    posicao,
    valorComparado: valorBrutoMensal,
    fatores,
    contexto,
    mediaNacionalGeral: round2(nacional),
    fonte: dados.meta,
  }
}

function round4(v: number): number {
  return Math.round(v * 10_000) / 10_000
}
