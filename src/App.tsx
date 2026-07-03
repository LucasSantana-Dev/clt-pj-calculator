import { useMemo, useState } from 'react'
import { cltToPj, pjToClt } from './engine/solve'
import { computeCushion, DEFAULT_CUSHION, type CushionInput } from './engine/cushion'
import { computeBenchmark } from './engine/benchmark'
import { computeTrends } from './engine/trends'
import { CalcForm, type CalcInputs } from './ui/CalcForm'
import { CltToPjResults, PjToCltResults } from './ui/Results'
import { Cushion } from './ui/Cushion'
import { Benchmark } from './ui/Benchmark'
import { Trends } from './ui/Trends'
import { Funnel } from './ui/Funnel'
import { Sources } from './ui/Sources'

const INITIAL_INPUTS: CalcInputs = {
  direction: 'clt-to-pj',
  value: 0,
  dependents: 0,
  vrVaMonthly: 0,
  monthlyHealthPlan: 0,
  homeOfficeAllowanceMonthly: 0,
  valeTransporteMonthly: 0,
  educationAllowanceMonthly: 0,
  otherBenefitsMonthly: 0,
  annualNetPlr: 0,
  monthlyAccountant: 300,
  customProLabore: null,
  seniority: 'pleno',
  area: 'backend',
  uf: 'SP',
  workMode: 'remoto',
  experience: '4-6',
}

export default function App() {
  const [inputs, setInputs] = useState<CalcInputs>(INITIAL_INPUTS)
  const [cushionConfig, setCushionConfig] = useState<Required<CushionInput>>(DEFAULT_CUSHION)

  const hasValue = inputs.value >= 1000

  const result = useMemo(() => {
    if (!hasValue) return null
    const pjOptions = {
      monthlyAccountant: inputs.monthlyAccountant,
      dependents: inputs.dependents,
      ...(inputs.customProLabore ? { customProLabore: inputs.customProLabore } : {}),
    }
    // Benefícios seguem a modalidade: home office só fora do presencial,
    // vale-transporte só fora do remoto (o desconto de 6% fica no motor).
    const cltOptions = {
      dependents: inputs.dependents,
      monthlyBenefits:
        inputs.vrVaMonthly +
        inputs.monthlyHealthPlan +
        inputs.educationAllowanceMonthly +
        inputs.otherBenefitsMonthly +
        (inputs.workMode !== 'presencial' ? inputs.homeOfficeAllowanceMonthly : 0),
      valeTransporteMonthly: inputs.workMode !== 'remoto' ? inputs.valeTransporteMonthly : 0,
      annualNetPlr: inputs.annualNetPlr,
    }
    if (inputs.direction === 'clt-to-pj') {
      return {
        kind: 'clt-to-pj' as const,
        eq: cltToPj({ grossSalary: inputs.value, ...cltOptions }, pjOptions),
      }
    }
    return {
      kind: 'pj-to-clt' as const,
      eq: pjToClt({ ...pjOptions, monthlyRevenue: inputs.value }, cltOptions),
    }
  }, [inputs, hasValue])

  const cushion = useMemo(() => {
    if (!result || result.kind !== 'clt-to-pj') return null
    return computeCushion(result.eq.equivalentRevenue, cushionConfig)
  }, [result, cushionConfig])

  const benchmark = useMemo(() => {
    if (!hasValue) return null
    return computeBenchmark(inputs.value, {
      seniority: inputs.seniority,
      area: inputs.area,
      uf: inputs.uf,
      contractType: inputs.direction === 'clt-to-pj' ? 'clt' : 'pj',
      experience: inputs.experience,
      workMode: inputs.workMode,
    })
  }, [inputs, hasValue])

  const trends = useMemo(() => computeTrends(inputs.seniority), [inputs.seniority])

  return (
    <div>
      <header className="site-header">
        <div className="container">
          <a href="https://criativaria.com" className="brand">
            Criativaria <span className="star">✦</span>
          </a>
          <nav className="nav">
            <a href="https://criativaria.com/">Início</a>
            <a href="https://criativaria.com/sobre">Sobre</a>
            <a href="https://criativaria.com/guias">Guias</a>
            <a href="https://criativaria.com/roadmaps">Roadmaps</a>
            <a href="https://criativaria.com/cursos">Cursos</a>
            <a href="https://criativaria.com/vagas">Vagas</a>
          </nav>
        </div>
      </header>

      <div className="page">
        <header className="hero">
          <p className="display eyebrow">CALCULADORA</p>
          <h1 className="display">CLT x PJ</h1>
          <p className="subtitle">
            Uma proposta PJ que parece maior nem sempre é. Aqui você compara os dois vínculos com a
            matemática completa de 2026, vê a faixa de mercado para o seu profile e recebe o valor com
            calma, sem hype.
          </p>
        </header>

        <CalcForm inputs={inputs} onChange={setInputs} />

        {!hasValue && (
          <p className="waiting note">
            Informe o valor da proposta acima para ver a comparação completa.
          </p>
        )}

        {result?.kind === 'clt-to-pj' && (
          <>
            <CltToPjResults eq={result.eq} />
            {cushion && <Cushion result={cushion} config={cushionConfig} onChange={setCushionConfig} />}
          </>
        )}
        {result?.kind === 'pj-to-clt' && <PjToCltResults eq={result.eq} />}

        {benchmark && <Benchmark result={benchmark} />}
        {hasValue && <Trends data={trends} />}
        {hasValue && <Funnel seniority={inputs.seniority} />}

        <Sources />

        <footer className="footnote note">
          <p>
            Cálculo 100% no seu navegador: nenhum valor que você digita sai desta página. Parâmetros
            fiscais de 2026 (INSS, IRRF com a Lei 15.270, Simples Nacional Anexos III e V, fator R).
            Benchmark: Pesquisa Código Fonte TV, edições 2021 a 2026. Esta ferramenta é educativa e não
            substitui contador ou advogado.
          </p>
        </footer>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-social">
            <a href="https://discord.gg/9mV9HnEkfT" target="_blank" rel="noopener noreferrer">
              Entrar na comunidade (Discord)
            </a>
            <a href="https://www.twitch.tv/criativaria" target="_blank" rel="noopener noreferrer">
              Acompanhar a live (Twitch)
            </a>
            <a href="https://apoia.se/criativaria" target="_blank" rel="noopener noreferrer">
              Apoiar na comunidade
            </a>
            <a href="https://criativaria.com/sobre">Sobre a Criativaria</a>
          </div>
          <p className="footer-legal">
            Criativaria · conteúdo open sob CC BY-SA 4.0 · feito pela comunidade
          </p>
        </div>
      </footer>
    </div>
  )
}
