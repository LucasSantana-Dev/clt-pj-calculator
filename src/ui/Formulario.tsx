import type { Dispatch, SetStateAction } from 'react'
import type { Area, Experiencia, Modalidade, Senioridade, Uf } from '../engine/benchmark'
import { AREAS, EXPERIENCIAS, MODALIDADES, SENIORIDADES, UFS } from './opcoes'
import { Select } from './Select'
import { CampoNumero } from './CampoNumero'

export type Direcao = 'clt-para-pj' | 'pj-para-clt'

export interface Entradas {
  direcao: Direcao
  valor: number
  dependentes: number
  vrVaMensal: number
  planoSaudeMensal: number
  auxHomeOfficeMensal: number
  valeTransporteMensal: number
  auxEducacaoMensal: number
  outrosBeneficiosMensais: number
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
        prefixo="R$"
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
          Benefícios mudam bastante a conta. Se a proposta CLT tem algum destes, vale informar. Os campos
          acompanham a modalidade que você escolheu.
        </p>
        <div className="grade-2">
          <CampoNumero
            id="vr-va"
            prefixo="R$"
            rotulo="VR / VA por mês"
            valor={entradas.vrVaMensal}
            aoMudar={(v) => muda('vrVaMensal', v)}
            passo={50}
          />
          <CampoNumero
            id="plano-saude"
            prefixo="R$"
            rotulo="Plano de saúde pago pela empresa (mês)"
            valor={entradas.planoSaudeMensal}
            aoMudar={(v) => muda('planoSaudeMensal', v)}
            passo={50}
          />
          {entradas.modalidade !== 'presencial' && (
            <CampoNumero
              id="aux-home-office"
              prefixo="R$"
              rotulo="Auxílio home office por mês"
              valor={entradas.auxHomeOfficeMensal}
              aoMudar={(v) => muda('auxHomeOfficeMensal', v)}
              passo={50}
            />
          )}
          {entradas.modalidade !== 'remoto' && (
            <CampoNumero
              id="vale-transporte"
              prefixo="R$"
              rotulo="Vale-transporte por mês"
              valor={entradas.valeTransporteMensal}
              aoMudar={(v) => muda('valeTransporteMensal', v)}
              passo={50}
            />
          )}
          <CampoNumero
            id="aux-educacao"
            prefixo="R$"
            rotulo="Auxílio educação / cursos por mês"
            valor={entradas.auxEducacaoMensal}
            aoMudar={(v) => muda('auxEducacaoMensal', v)}
            passo={50}
          />
          <CampoNumero
            id="outros-beneficios"
            prefixo="R$"
            rotulo="Outros benefícios por mês"
            valor={entradas.outrosBeneficiosMensais}
            aoMudar={(v) => muda('outrosBeneficiosMensais', v)}
            passo={50}
          />
          <CampoNumero
            id="plr"
            prefixo="R$"
            rotulo="PLR líquida estimada por ano"
            valor={entradas.plrLiquidaAnual}
            aoMudar={(v) => muda('plrLiquidaAnual', v)}
          />
        </div>
        {entradas.modalidade !== 'remoto' && (
          <p className="nota">
            No vale-transporte a lei permite descontar até 6% do salário; a calculadora já considera só o
            que sobra disso como benefício real.
          </p>
        )}
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
          prefixo="R$"
            rotulo="Contador por mês"
            valor={entradas.contadorMensal}
            aoMudar={(v) => muda('contadorMensal', v)}
          />
          <CampoNumero
            id="prolabore"
          prefixo="R$"
            rotulo="Pró-labore fixo (0 = otimizar)"
            valor={entradas.proLaboreCustom ?? 0}
            aoMudar={(v) => muda('proLaboreCustom', v > 0 ? v : null)}
          />
        </div>
      </details>
    </section>
  )
}
