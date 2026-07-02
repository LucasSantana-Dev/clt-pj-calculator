/**
 * Conversões bidirecionais: busca binária pelo valor que iguala o líquido anual.
 */
import { calculaClt, type CltInput, type CltResult } from './clt'
import { calculaPj, type PjInput, type PjResult } from './pj'
import { round2 } from './impostos'

export interface EquivalenciaCltParaPj {
  clt: CltResult
  pj: PjResult
  /** Faturamento mensal PJ que empata o líquido anual do pacote CLT. */
  faturamentoEquivalente: number
}

export interface EquivalenciaPjParaClt {
  pj: PjResult
  clt: CltResult
  /** Salário bruto CLT que empata o líquido anual do PJ. */
  salarioEquivalente: number
}

function buscaBinaria(
  alvo: number,
  liquidoAnualDe: (x: number) => number,
  limiteSuperiorInicial: number,
): number {
  let lo = 0
  let hi = limiteSuperiorInicial
  while (liquidoAnualDe(hi) < alvo) {
    hi *= 2
    if (hi > 10_000_000) break
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (liquidoAnualDe(mid) < alvo) lo = mid
    else hi = mid
  }
  return round2((lo + hi) / 2)
}

export function cltParaPj(
  entrada: CltInput,
  pjOpcoes: Omit<PjInput, 'faturamentoMensal'> = {},
): EquivalenciaCltParaPj {
  const clt = calculaClt(entrada)
  const faturamentoEquivalente = buscaBinaria(
    clt.liquidoAnualTotal,
    (f) => calculaPj({ ...pjOpcoes, faturamentoMensal: f }).liquidoAnualTotal,
    entrada.salarioBruto * 2 + 1000,
  )
  const pj = calculaPj({ ...pjOpcoes, faturamentoMensal: faturamentoEquivalente })
  return { clt, pj, faturamentoEquivalente }
}

export function pjParaClt(
  entrada: PjInput,
  cltOpcoes: Omit<CltInput, 'salarioBruto'> = {},
): EquivalenciaPjParaClt {
  const pj = calculaPj(entrada)
  const salarioEquivalente = buscaBinaria(
    pj.liquidoAnualTotal,
    (s) => calculaClt({ ...cltOpcoes, salarioBruto: s }).liquidoAnualTotal,
    entrada.faturamentoMensal * 2 + 1000,
  )
  const clt = calculaClt({ ...cltOpcoes, salarioBruto: salarioEquivalente })
  return { pj, clt, salarioEquivalente }
}
