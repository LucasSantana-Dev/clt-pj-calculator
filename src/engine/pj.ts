/**
 * Lado PJ: Simples Nacional (Anexos III e V) com otimização automática de fator R.
 *
 * Modelo (dev solo, regime estável):
 * - RBT12 = 12 × faturamento mensal.
 * - DAS mensal = alíquota efetiva × faturamento; alíquota efetiva =
 *   (RBT12 × nominal − parcela a deduzir) / RBT12.
 * - Fator R = folha 12m / RBT12; folha = 12 × pró-labore (sem 13º de pró-labore).
 *   Fator R ≥ 28% → Anexo III; senão Anexo V.
 * - Sem CPP separada nos Anexos III e V (embutida no DAS).
 * - Pró-labore: INSS contribuinte individual 11% (até o teto) + IRRF pela tabela
 *   mensal, sem redução da Lei 15.270 (sem orientação oficial; conservador).
 * - Lucros distribuídos são isentos na PF.
 * - Líquido anual da pessoa = 12 × (faturamento − DAS − contador − INSS_pl − IRRF_pl).
 *
 * Estratégias comparadas automaticamente:
 * A) pró-labore mínimo (salário mínimo) — anexo decidido pelo fator R resultante;
 * B) pró-labore em 28% do faturamento — força Anexo III.
 * Vence a de maior líquido anual; pró-labore customizado desativa a otimização.
 */
import {
  FATOR_R_LIMIAR,
  INSS_PRO_LABORE_ALIQUOTA,
  INSS_TETO,
  SALARIO_MINIMO,
  SIMPLES_ANEXO_III,
  SIMPLES_ANEXO_V,
  CONTADOR_MENSAL_PADRAO,
  type FaixaSimples,
} from './tables2026'
import { irrfMensal, round2 } from './impostos'

export type Anexo = 'III' | 'V'

export interface PjInput {
  faturamentoMensal: number
  /** Pró-labore mensal customizado; se ausente, o motor otimiza. */
  proLaboreCustom?: number
  contadorMensal?: number
  dependentes?: number
}

export interface PjResult {
  liquidoAnualTotal: number
  mediaMensal: number
  anexo: Anexo
  fatorR: number
  proLabore: number
  estrategia: 'pro-labore-minimo' | 'fator-r-28' | 'customizado'
  breakdown: {
    dasMensal: number
    aliquotaEfetiva: number
    inssProLabore: number
    irrfProLabore: number
    contadorMensal: number
    lucrosDistribuidosMensais: number
  }
}

export function aliquotaEfetiva(rbt12: number, tabela: FaixaSimples[]): number {
  const faixa = tabela.find((f) => rbt12 <= f.rbt12Ate) ?? tabela[tabela.length - 1]
  return (rbt12 * faixa.aliquotaNominal - faixa.parcelaDeduzir) / rbt12
}

function avaliaCenario(
  faturamentoMensal: number,
  proLabore: number,
  contadorMensal: number,
  dependentes: number,
): Omit<PjResult, 'estrategia'> {
  const rbt12 = faturamentoMensal * 12
  const folha12m = proLabore * 12
  const fatorR = folha12m / rbt12
  const anexo: Anexo = fatorR >= FATOR_R_LIMIAR ? 'III' : 'V'
  const tabela = anexo === 'III' ? SIMPLES_ANEXO_III : SIMPLES_ANEXO_V

  const efetiva = aliquotaEfetiva(rbt12, tabela)
  const dasMensal = round2(faturamentoMensal * efetiva)

  const inssProLabore = round2(Math.min(proLabore, INSS_TETO) * INSS_PRO_LABORE_ALIQUOTA)
  const irrfProLabore = irrfMensal({
    rendimento: proLabore,
    inss: inssProLabore,
    dependentes,
    aplicarLei15270: false,
  })

  const liquidoMensal = faturamentoMensal - dasMensal - contadorMensal - inssProLabore - irrfProLabore
  const liquidoAnualTotal = round2(liquidoMensal * 12)

  return {
    liquidoAnualTotal,
    mediaMensal: round2(liquidoMensal),
    anexo,
    fatorR,
    proLabore,
    breakdown: {
      dasMensal,
      aliquotaEfetiva: efetiva,
      inssProLabore,
      irrfProLabore,
      contadorMensal,
      lucrosDistribuidosMensais: round2(faturamentoMensal - dasMensal - contadorMensal - proLabore),
    },
  }
}

export function calculaPj(input: PjInput): PjResult {
  const {
    faturamentoMensal,
    proLaboreCustom,
    contadorMensal = CONTADOR_MENSAL_PADRAO,
    dependentes = 0,
  } = input

  if (proLaboreCustom !== undefined) {
    return {
      ...avaliaCenario(faturamentoMensal, proLaboreCustom, contadorMensal, dependentes),
      estrategia: 'customizado',
    }
  }

  const minimo = avaliaCenario(faturamentoMensal, SALARIO_MINIMO, contadorMensal, dependentes)
  // Arredonda o pró-labore para cima (centavo) para garantir fator R ≥ 28%;
  // arredondar para baixo derrubaria o cenário para o Anexo V por 0,000001.
  const proLabore28 = Math.ceil((faturamentoMensal * FATOR_R_LIMIAR - 1e-9) * 100) / 100
  const fatorR28 = avaliaCenario(
    faturamentoMensal,
    Math.max(SALARIO_MINIMO, proLabore28),
    contadorMensal,
    dependentes,
  )

  return minimo.liquidoAnualTotal >= fatorR28.liquidoAnualTotal
    ? { ...minimo, estrategia: 'pro-labore-minimo' }
    : { ...fatorR28, estrategia: 'fator-r-28' }
}
