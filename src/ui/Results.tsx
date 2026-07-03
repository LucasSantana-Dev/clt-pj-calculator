import type { CltToPjEquivalence, PjToCltEquivalence } from '../engine/solve'
import { brl, brlExact, pct } from './format'
import { CountUp } from './CountUp'

const STRATEGY_LABEL = {
  'min-pro-labore': 'pró-labore mínimo (um salário mínimo)',
  'fator-r-28': 'pró-labore em 28% do faturamento, para cair no Anexo III (fator R)',
  custom: 'pró-labore fixado por você',
} as const

export function CltToPjResults({ eq }: { eq: CltToPjEquivalence }) {
  const { clt, pj, equivalentRevenue } = eq
  return (
    <section className="results">
      <div className="cri-card-flat highlight">
        <p className="highlight-caption">Para empatar com esse pacote CLT, seu PJ precisa faturar</p>
        <p className="highlight-value display"><CountUp value={equivalentRevenue} format={brl} /><span className="highlight-unit">/mês</span></p>
        <p className="note">
          Empate no líquido anual: {brlExact(clt.totalAnnualNet)} no ano, contando 13º, férias com um
          terço, FGTS e os benefícios que você informou. Isso ainda não inclui o colchão de segurança,
          que vem logo abaixo.
        </p>
      </div>

      <div className="grid-2">
        <div className="cri-card-flat side">
          <h3 className="display">Lado CLT</h3>
          <dl>
            <div><dt>Líquido em mês normal</dt><dd>{brlExact(clt.breakdown.normalMonthNet)}</dd></div>
            <div><dt>INSS / IRRF por mês</dt><dd>{brlExact(clt.breakdown.normalMonthInss)} / {brlExact(clt.breakdown.normalMonthIrrf)}</dd></div>
            <div><dt>13º líquido</dt><dd>{brlExact(clt.breakdown.thirteenthNet)}</dd></div>
            <div><dt>Mês de férias (com o terço)</dt><dd>{brlExact(clt.breakdown.vacationMonthNet)}</dd></div>
            <div><dt>FGTS depositado no ano</dt><dd>{brlExact(clt.breakdown.annualFgts)}</dd></div>
            {clt.breakdown.annualBenefits > 0 && (
              <div><dt>Benefícios no ano</dt><dd>{brlExact(clt.breakdown.annualBenefits)}</dd></div>
            )}
            {clt.breakdown.annualNetPlr > 0 && (
              <div><dt>PLR líquida no ano</dt><dd>{brlExact(clt.breakdown.annualNetPlr)}</dd></div>
            )}
          </dl>
        </div>

        <div className="cri-card-flat side">
          <h3 className="display">Lado PJ</h3>
          <dl>
            <div><dt>Simples Nacional (Annex {pj.annex})</dt><dd>{brlExact(pj.breakdown.monthlyDas)}/mês</dd></div>
            <div><dt>Alíquota efetiva</dt><dd>{pct(pj.breakdown.effectiveRate * 100, 2)}</dd></div>
            <div><dt>Pró-labore</dt><dd>{brlExact(pj.proLabore)}</dd></div>
            <div><dt>INSS + IRRF do pró-labore</dt><dd>{brlExact(pj.breakdown.proLaboreInss + pj.breakdown.proLaboreIrrf)}/mês</dd></div>
            <div><dt>Contador</dt><dd>{brlExact(pj.breakdown.monthlyAccountant)}/mês</dd></div>
            <div><dt>Líquido médio mensal</dt><dd>{brlExact(pj.monthlyAverage)}</dd></div>
          </dl>
          <p className="note">
            A calculadora escolheu {STRATEGY_LABEL[pj.strategy]}. Fator R resultante:{' '}
            {pct(pj.fatorR * 100, 1)}.
          </p>
        </div>
      </div>
    </section>
  )
}

export function PjToCltResults({ eq }: { eq: PjToCltEquivalence }) {
  const { pj, clt, equivalentSalary } = eq
  return (
    <section className="results">
      <div className="cri-card-flat highlight">
        <p className="highlight-caption">Esse faturamento PJ equivale a um salário CLT de</p>
        <p className="highlight-value display"><CountUp value={equivalentSalary} format={brl} /><span className="highlight-unit">/mês (bruto)</span></p>
        <p className="note">
          Empate no líquido anual: {brlExact(pj.totalAnnualNet)} no ano. No CLT esse valor já viria com
          13º, férias com um terço, FGTS e a estabilidade do vínculo. No PJ, quem cobre isso é você. Uma
          proposta PJ que só empata costuma valer menos na prática.
        </p>
      </div>

      <div className="grid-2">
        <div className="cri-card-flat side">
          <h3 className="display">Lado PJ</h3>
          <dl>
            <div><dt>Simples Nacional (Annex {pj.annex})</dt><dd>{brlExact(pj.breakdown.monthlyDas)}/mês</dd></div>
            <div><dt>Pró-labore</dt><dd>{brlExact(pj.proLabore)}</dd></div>
            <div><dt>INSS + IRRF do pró-labore</dt><dd>{brlExact(pj.breakdown.proLaboreInss + pj.breakdown.proLaboreIrrf)}/mês</dd></div>
            <div><dt>Contador</dt><dd>{brlExact(pj.breakdown.monthlyAccountant)}/mês</dd></div>
            <div><dt>Líquido médio mensal</dt><dd>{brlExact(pj.monthlyAverage)}</dd></div>
          </dl>
          <p className="note">
            Arranjo usado: {STRATEGY_LABEL[pj.strategy]}. Fator R: {pct(pj.fatorR * 100, 1)}.
          </p>
        </div>
        <div className="cri-card-flat side">
          <h3 className="display">Lado CLT equivalente</h3>
          <dl>
            <div><dt>Líquido em mês normal</dt><dd>{brlExact(clt.breakdown.normalMonthNet)}</dd></div>
            <div><dt>13º líquido</dt><dd>{brlExact(clt.breakdown.thirteenthNet)}</dd></div>
            <div><dt>Mês de férias (com o terço)</dt><dd>{brlExact(clt.breakdown.vacationMonthNet)}</dd></div>
            <div><dt>FGTS depositado no ano</dt><dd>{brlExact(clt.breakdown.annualFgts)}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}
