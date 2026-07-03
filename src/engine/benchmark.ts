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
import data from '../data/benchmark2026.json'
import { round2 } from './taxes'

export type Seniority = keyof typeof data.seniority
export type Area = keyof typeof data.area
export type Uf = keyof typeof data.uf
export type Experience = keyof typeof data.experience
export type ContractType = 'clt' | 'pj'
export type WorkMode = 'remoto' | 'hibrido' | 'presencial'

const RANGE_WIDTH = 0.15

export interface BenchmarkProfile {
  seniority: Seniority
  area: Area
  uf: Uf
  contractType: ContractType
  experience?: Experience
  workMode?: WorkMode
}

export interface ExplainedFactor {
  key: 'seniority-base' | 'area' | 'uf' | 'contract'
  label: string
  value: number
  reference: number
}

export interface ExplainedContext {
  label: string
  text: string
}

export type Position = 'below' | 'within' | 'above'

export interface BenchmarkResult {
  centralEstimate: number
  rangeMin: number
  rangeMax: number
  position: Position
  comparedValue: number
  factors: ExplainedFactor[]
  context: ExplainedContext[]
  nationalAverage: number
  source: typeof data.meta
}

/** Média nacional geral: média das UFs ponderada pelo nº de respondentes. */
export function nationalAverage(): number {
  const ufList = Object.values(data.uf)
  const weightedSum = ufList.reduce((s, u) => s + u.mean * u.n, 0)
  const n = ufList.reduce((s, u) => s + u.n, 0)
  return weightedSum / n
}

const EXPERIENCE_LABEL: Record<Experience, string> = {
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

export function computeBenchmark(grossMonthlyValue: number, profile: BenchmarkProfile): BenchmarkResult {
  const national = nationalAverage()

  const base = data.seniority[profile.seniority]
  const areaFactor = data.area[profile.area] / national
  const ufFactor = data.uf[profile.uf].mean / national
  const contractFactor = data.contractType[profile.contractType] / national

  const centralEstimate = round2(base * areaFactor * ufFactor * contractFactor)
  const rangeMin = round2(centralEstimate * (1 - RANGE_WIDTH))
  const rangeMax = round2(centralEstimate * (1 + RANGE_WIDTH))

  const position: Position =
    grossMonthlyValue < rangeMin ? 'below' : grossMonthlyValue > rangeMax ? 'above' : 'within'

  const factors: ExplainedFactor[] = [
    {
      key: 'seniority-base',
      label: `Média nacional da senioridade`,
      value: base,
      reference: national,
    },
    { key: 'area', label: 'Ajuste pela área', value: round4(areaFactor), reference: data.area[profile.area] },
    { key: 'uf', label: 'Ajuste pela UF', value: round4(ufFactor), reference: data.uf[profile.uf].mean },
    {
      key: 'contract',
      label: profile.contractType === 'pj' ? 'Ajuste para PJ' : 'Ajuste para CLT',
      value: round4(contractFactor),
      reference: data.contractType[profile.contractType],
    },
  ]

  const context: ExplainedContext[] = []
  if (profile.experience) {
    context.push({
      label: 'Tempo de experiência',
      text: `Quem tem ${EXPERIENCE_LABEL[profile.experience]} de área recebe em média R$ ${data.experience[profile.experience].toLocaleString('pt-BR')}. Não multiplicamos esse fator porque ele já anda junto com a senioridade.`,
    })
  }
  if (profile.workMode) {
    context.push({
      label: 'Modalidade',
      text: `A pesquisa não publica salário por modalidade; ${data.workModeDistribution.remoto.toLocaleString('pt-BR')}% do mercado trabalha remoto. Trabalho remoto costuma ampliar o leque de vagas e de faixas acessíveis.`,
    })
  }

  return {
    centralEstimate,
    rangeMin,
    rangeMax,
    position,
    comparedValue: grossMonthlyValue,
    factors,
    context,
    nationalAverage: round2(national),
    source: data.meta,
  }
}

function round4(v: number): number {
  return Math.round(v * 10_000) / 10_000
}
