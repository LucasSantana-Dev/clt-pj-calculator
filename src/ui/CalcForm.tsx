import type { Dispatch, SetStateAction } from 'react'
import type { Area, Experience, WorkMode, Seniority, Uf } from '../engine/benchmark'
import { AREA_OPTIONS, EXPERIENCE_OPTIONS, WORK_MODE_OPTIONS, SENIORITY_OPTIONS, UF_OPTIONS } from './options'
import { Select } from './Select'
import { NumberField } from './NumberField'

export type Direction = 'clt-to-pj' | 'pj-to-clt'

export interface CalcInputs {
  direction: Direction
  value: number
  dependents: number
  vrVaMonthly: number
  monthlyHealthPlan: number
  homeOfficeAllowanceMonthly: number
  valeTransporteMonthly: number
  educationAllowanceMonthly: number
  otherBenefitsMonthly: number
  annualNetPlr: number
  monthlyAccountant: number
  customProLabore: number | null
  seniority: Seniority
  area: Area
  uf: Uf
  workMode: WorkMode
  experience: Experience
}

interface Props {
  inputs: CalcInputs
  onChange: Dispatch<SetStateAction<CalcInputs>>
}


export function CalcForm({ inputs, onChange }: Props) {
  const isCltToPj = inputs.direction === 'clt-to-pj'
  const update = <K extends keyof CalcInputs>(key: K, value: CalcInputs[K]) =>
    onChange((atual) => ({ ...atual, [key]: value }))

  return (
    <section className="cri-card-flat calc-form">
      <div className="direction-toggle" role="tablist" aria-label="Direção da conversão">
        <button
          role="tab"
          aria-selected={isCltToPj}
          className={isCltToPj ? 'ativo' : ''}
          onClick={() => update('direction', 'clt-to-pj')}
        >
          Tenho proposta CLT
        </button>
        <button
          role="tab"
          aria-selected={!isCltToPj}
          className={!isCltToPj ? 'ativo' : ''}
          onClick={() => update('direction', 'pj-to-clt')}
        >
          Tenho proposta PJ
        </button>
      </div>

      <NumberField
        id="gross-value"
        prefix="R$"
        label={isCltToPj ? 'Salário bruto mensal (CLT)' : 'Faturamento mensal (PJ)'}
        value={inputs.value}
        onChange={(v) => update('value', v)}
      />

      <div className="profile-grid">
        <div className="field">
          <label className="field-label" htmlFor="seniority">Senioridade</label>
          <Select
            id="seniority"
            value={inputs.seniority}
            options={SENIORITY_OPTIONS}
            onChange={(v: Seniority) => update('seniority', v)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="area">Área</label>
          <Select id="area" value={inputs.area} options={AREA_OPTIONS} onChange={(v: Area) => update('area', v)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="uf">Estado</label>
          <Select id="uf" value={inputs.uf} options={UF_OPTIONS} onChange={(v: Uf) => update('uf', v)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="experience">Tempo de experiência</label>
          <Select
            id="experience"
            value={inputs.experience}
            options={EXPERIENCE_OPTIONS}
            onChange={(v: Experience) => update('experience', v)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="work-mode">Modalidade</label>
          <Select
            id="work-mode"
            value={inputs.workMode}
            options={WORK_MODE_OPTIONS}
            onChange={(v: WorkMode) => update('workMode', v)}
          />
        </div>
        <NumberField
          id="dependents"
          label="Dependentes no IR"
          value={inputs.dependents}
          onChange={(v) => update('dependents', Math.floor(v))}
          prefix="nº"
          step={1}
        />
      </div>

      <details className="optional-block">
        <summary>Benefícios do CLT (opcional)</summary>
        <p className="note">
          Benefícios mudam bastante a conta. Se a proposta CLT tem algum destes, vale informar. Os campos
          acompanham a modalidade que você escolheu.
        </p>
        <div className="grid-2">
          <NumberField
            id="vr-va"
            prefix="R$"
            label="VR / VA por mês"
            value={inputs.vrVaMonthly}
            onChange={(v) => update('vrVaMonthly', v)}
            step={50}
          />
          <NumberField
            id="health-plan"
            prefix="R$"
            label="Plano de saúde pago pela empresa (mês)"
            value={inputs.monthlyHealthPlan}
            onChange={(v) => update('monthlyHealthPlan', v)}
            step={50}
          />
          {inputs.workMode !== 'presencial' && (
            <NumberField
              id="home-office-allowance"
              prefix="R$"
              label="Auxílio home office por mês"
              value={inputs.homeOfficeAllowanceMonthly}
              onChange={(v) => update('homeOfficeAllowanceMonthly', v)}
              step={50}
            />
          )}
          {inputs.workMode !== 'remoto' && (
            <NumberField
              id="vale-transporte"
              prefix="R$"
              label="Vale-transporte por mês"
              value={inputs.valeTransporteMonthly}
              onChange={(v) => update('valeTransporteMonthly', v)}
              step={50}
            />
          )}
          <NumberField
            id="education-allowance"
            prefix="R$"
            label="Auxílio educação / cursos por mês"
            value={inputs.educationAllowanceMonthly}
            onChange={(v) => update('educationAllowanceMonthly', v)}
            step={50}
          />
          <NumberField
            id="other-benefits"
            prefix="R$"
            label="Outros benefícios por mês"
            value={inputs.otherBenefitsMonthly}
            onChange={(v) => update('otherBenefitsMonthly', v)}
            step={50}
          />
          <NumberField
            id="plr"
            prefix="R$"
            label="PLR líquida estimada por ano"
            value={inputs.annualNetPlr}
            onChange={(v) => update('annualNetPlr', v)}
          />
        </div>
        {inputs.workMode !== 'remoto' && (
          <p className="note">
            No vale-transporte a lei permite descontar até 6% do salário; a calculadora já considera só o
            que sobra disso como benefício real.
          </p>
        )}
      </details>

      <details className="optional-block">
        <summary>Ajustes avançados do PJ (opcional)</summary>
        <p className="note">
          Por padrão a calculadora choose o arranjo mais barato entre pró-labore mínimo e pró-labore de 28%
          do faturamento (fator R). Você pode fixar um pró-labore ou mudar o custo do contador.
        </p>
        <div className="grid-2">
          <NumberField
            id="accountant"
          prefix="R$"
            label="Contador por mês"
            value={inputs.monthlyAccountant}
            onChange={(v) => update('monthlyAccountant', v)}
          />
          <NumberField
            id="pro-labore"
          prefix="R$"
            label="Pró-labore fixo (0 = otimizar)"
            value={inputs.customProLabore ?? 0}
            onChange={(v) => update('customProLabore', v > 0 ? v : null)}
          />
        </div>
      </details>
    </section>
  )
}
