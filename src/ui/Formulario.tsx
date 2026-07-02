import type { Dispatch, SetStateAction } from 'react'
import type { Area, Experiencia, Modalidade, Senioridade, Uf } from '../engine/benchmark'
import { AREAS, EXPERIENCIAS, MODALIDADES, SENIORIDADES, UFS } from './opcoes'
import { Select } from './Select'

export type Direcao = 'clt-para-pj' | 'pj-para-clt'

export interface Entradas {
  direcao: Direcao
  valor: number
  dependentes: number
  beneficiosMensais: number
  plrLiquidaAnual: number
  contadorMensal: number
  proLaboreCustom: number | null
  senioridade: Senioridade
  area: Area
  uf: Uf
  modalidade: Modalidade
  experiencia: Experiencia
}

interface Props {
  entradas: Entradas
  aoMudar: Dispatch<SetStateAction<Entradas>>
}

function CampoNumero({
  id,
  rotulo,
  valor,
  aoMudar,
  prefixo = 'R$',
  passo = 100,
}: {
  id: string
  rotulo: string
  valor: number
  aoMudar: (v: number) => void
  prefixo?: string
  passo?: number
}) {
  return (
    <label className="campo" htmlFor={id}>
      <span className="campo-rotulo">{rotulo}</span>
      <span className="campo-input">
        <span className="campo-prefixo">{prefixo}</span>
        <input
          id={id}
          type="number"
          min={0}
          step={passo}
          value={valor || ''}
          onChange={(e) => aoMudar(Number(e.target.value) || 0)}
        />
      </span>
    </label>
  )
}

export function Formulario({ entradas, aoMudar }: Props) {
  const ehCltParaPj = entradas.direcao === 'clt-para-pj'
  const muda = <K extends keyof Entradas>(chave: K, valor: Entradas[K]) =>
    aoMudar((atual) => ({ ...atual, [chave]: valor }))

  return (
    <section className="cri-card-flat formulario">
      <div className="toggle-direcao" role="tablist" aria-label="Direção da conversão">
        <button
          role="tab"
          aria-selected={ehCltParaPj}
          className={ehCltParaPj ? 'ativo' : ''}
          onClick={() => muda('direcao', 'clt-para-pj')}
        >
          Tenho proposta CLT
        </button>
        <button
          role="tab"
          aria-selected={!ehCltParaPj}
          className={!ehCltParaPj ? 'ativo' : ''}
          onClick={() => muda('direcao', 'pj-para-clt')}
        >
          Tenho proposta PJ
        </button>
      </div>

      <CampoNumero
        id="valor"
        rotulo={ehCltParaPj ? 'Salário bruto mensal (CLT)' : 'Faturamento mensal (PJ)'}
        valor={entradas.valor}
        aoMudar={(v) => muda('valor', v)}
      />

      <div className="grade-perfil">
        <div className="campo">
          <label className="campo-rotulo" htmlFor="senioridade">Senioridade</label>
          <Select
            id="senioridade"
            valor={entradas.senioridade}
            opcoes={SENIORIDADES}
            aoMudar={(v: Senioridade) => muda('senioridade', v)}
          />
        </div>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="area">Área</label>
          <Select id="area" valor={entradas.area} opcoes={AREAS} aoMudar={(v: Area) => muda('area', v)} />
        </div>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="uf">Estado</label>
          <Select id="uf" valor={entradas.uf} opcoes={UFS} aoMudar={(v: Uf) => muda('uf', v)} />
        </div>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="experiencia">Tempo de experiência</label>
          <Select
            id="experiencia"
            valor={entradas.experiencia}
            opcoes={EXPERIENCIAS}
            aoMudar={(v: Experiencia) => muda('experiencia', v)}
          />
        </div>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="modalidade">Modalidade</label>
          <Select
            id="modalidade"
            valor={entradas.modalidade}
            opcoes={MODALIDADES}
            aoMudar={(v: Modalidade) => muda('modalidade', v)}
          />
        </div>
        <CampoNumero
          id="dependentes"
          rotulo="Dependentes no IR"
          valor={entradas.dependentes}
          aoMudar={(v) => muda('dependentes', Math.floor(v))}
          prefixo="nº"
          passo={1}
        />
      </div>

      <details className="bloco-opcional">
        <summary>Benefícios do CLT (opcional)</summary>
        <p className="nota">
          Vale-refeição, plano de saúde pago pela empresa e PLR mudam bastante a conta. Se a proposta CLT
          tem benefícios, vale informar.
        </p>
        <div className="grade-2">
          <CampoNumero
            id="beneficios"
            rotulo="Benefícios mensais (VR, VA, plano, etc.)"
            valor={entradas.beneficiosMensais}
            aoMudar={(v) => muda('beneficiosMensais', v)}
          />
          <CampoNumero
            id="plr"
            rotulo="PLR líquida estimada por ano"
            valor={entradas.plrLiquidaAnual}
            aoMudar={(v) => muda('plrLiquidaAnual', v)}
          />
        </div>
      </details>

      <details className="bloco-opcional">
        <summary>Ajustes avançados do PJ (opcional)</summary>
        <p className="nota">
          Por padrão a calculadora escolhe o arranjo mais barato entre pró-labore mínimo e pró-labore de 28%
          do faturamento (fator R). Você pode fixar um pró-labore ou mudar o custo do contador.
        </p>
        <div className="grade-2">
          <CampoNumero
            id="contador"
            rotulo="Contador por mês"
            valor={entradas.contadorMensal}
            aoMudar={(v) => muda('contadorMensal', v)}
          />
          <CampoNumero
            id="prolabore"
            rotulo="Pró-labore fixo (0 = otimizar)"
            valor={entradas.proLaboreCustom ?? 0}
            aoMudar={(v) => muda('proLaboreCustom', v > 0 ? v : null)}
          />
        </div>
      </details>
    </section>
  )
}
