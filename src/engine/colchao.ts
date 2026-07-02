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
import { round2 } from './impostos'

export interface ColchaoInput {
  /** Semanas de férias por ano sem faturar. Padrão 4 (~30 dias). */
  semanasFerias?: number
  /** Semanas estimadas paradas entre contratos por ano. Padrão 2. */
  semanasInatividade?: number
  /** Plano de saúde mensal pago do próprio bolso. Padrão R$ 400. */
  planoSaudeMensal?: number
  /** Aporte mensal de previdência para compensar FGTS/aposentadoria. Padrão R$ 0. */
  previdenciaMensal?: number
}

export interface ColchaoItem {
  chave: 'ferias' | 'inatividade' | 'plano-saude' | 'previdencia'
  rotulo: string
  /** Acréscimo mensal em R$ sobre o faturamento equivalente. */
  acrescimoMensal: number
}

export interface ColchaoResult {
  itens: ColchaoItem[]
  acrescimoMensalTotal: number
  /** Faturamento mensal recomendado (equivalência + colchão). */
  faturamentoRecomendado: number
  /** Percentual do colchão sobre a equivalência pura. */
  percentual: number
}

export const COLCHAO_PADRAO: Required<ColchaoInput> = {
  semanasFerias: 4,
  semanasInatividade: 2,
  planoSaudeMensal: 400,
  previdenciaMensal: 0,
}

export function calculaColchao(faturamentoEquivalente: number, input: ColchaoInput = {}): ColchaoResult {
  const cfg = { ...COLCHAO_PADRAO, ...input }

  const fatorFerias = 52 / (52 - cfg.semanasFerias) - 1
  const fatorInatividade =
    52 / (52 - cfg.semanasFerias - cfg.semanasInatividade) - 52 / (52 - cfg.semanasFerias)

  const itens: ColchaoItem[] = [
    {
      chave: 'ferias',
      rotulo: 'Férias sem faturar',
      acrescimoMensal: round2(faturamentoEquivalente * fatorFerias),
    },
    {
      chave: 'inatividade',
      rotulo: 'Períodos entre contratos',
      acrescimoMensal: round2(faturamentoEquivalente * fatorInatividade),
    },
    {
      chave: 'plano-saude',
      rotulo: 'Plano de saúde próprio',
      acrescimoMensal: round2(cfg.planoSaudeMensal),
    },
    {
      chave: 'previdencia',
      rotulo: 'Previdência complementar',
      acrescimoMensal: round2(cfg.previdenciaMensal),
    },
  ]

  const acrescimoMensalTotal = round2(itens.reduce((s, i) => s + i.acrescimoMensal, 0))
  const faturamentoRecomendado = round2(faturamentoEquivalente + acrescimoMensalTotal)

  return {
    itens,
    acrescimoMensalTotal,
    faturamentoRecomendado,
    percentual: faturamentoEquivalente > 0 ? round2((acrescimoMensalTotal / faturamentoEquivalente) * 100) : 0,
  }
}
