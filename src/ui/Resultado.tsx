import type { EquivalenciaCltParaPj, EquivalenciaPjParaClt } from '../engine/solve'
import { brl, brlExato, pct } from './formato'
import { CountUp } from './CountUp'

const ROTULO_ESTRATEGIA = {
  'pro-labore-minimo': 'pró-labore mínimo (um salário mínimo)',
  'fator-r-28': 'pró-labore em 28% do faturamento, para cair no Anexo III (fator R)',
  customizado: 'pró-labore fixado por você',
} as const

export function ResultadoCltParaPj({ eq }: { eq: EquivalenciaCltParaPj }) {
  const { clt, pj, faturamentoEquivalente } = eq
  return (
    <section className="resultado">
      <div className="cri-card-flat destaque">
        <p className="destaque-legenda">Para empatar com esse pacote CLT, seu PJ precisa faturar</p>
        <p className="destaque-valor display"><CountUp valor={faturamentoEquivalente} formato={brl} /><span className="destaque-mes">/mês</span></p>
        <p className="nota">
          Empate no líquido anual: {brlExato(clt.liquidoAnualTotal)} no ano, contando 13º, férias com um
          terço, FGTS e os benefícios que você informou. Isso ainda não inclui o colchão de segurança,
          que vem logo abaixo.
        </p>
      </div>

      <div className="grade-2">
        <div className="cri-card-flat lado">
          <h3 className="display">Lado CLT</h3>
          <dl>
            <div><dt>Líquido em mês normal</dt><dd>{brlExato(clt.breakdown.liquidoMesNormal)}</dd></div>
            <div><dt>INSS / IRRF por mês</dt><dd>{brlExato(clt.breakdown.inssMesNormal)} / {brlExato(clt.breakdown.irrfMesNormal)}</dd></div>
            <div><dt>13º líquido</dt><dd>{brlExato(clt.breakdown.liquido13)}</dd></div>
            <div><dt>Mês de férias (com o terço)</dt><dd>{brlExato(clt.breakdown.liquidoMesFerias)}</dd></div>
            <div><dt>FGTS depositado no ano</dt><dd>{brlExato(clt.breakdown.fgtsAnual)}</dd></div>
            {clt.breakdown.beneficiosAnuais > 0 && (
              <div><dt>Benefícios no ano</dt><dd>{brlExato(clt.breakdown.beneficiosAnuais)}</dd></div>
            )}
            {clt.breakdown.plrLiquidaAnual > 0 && (
              <div><dt>PLR líquida no ano</dt><dd>{brlExato(clt.breakdown.plrLiquidaAnual)}</dd></div>
            )}
          </dl>
        </div>

        <div className="cri-card-flat lado">
          <h3 className="display">Lado PJ</h3>
          <dl>
            <div><dt>Simples Nacional (Anexo {pj.anexo})</dt><dd>{brlExato(pj.breakdown.dasMensal)}/mês</dd></div>
            <div><dt>Alíquota efetiva</dt><dd>{pct(pj.breakdown.aliquotaEfetiva * 100, 2)}</dd></div>
            <div><dt>Pró-labore</dt><dd>{brlExato(pj.proLabore)}</dd></div>
            <div><dt>INSS + IRRF do pró-labore</dt><dd>{brlExato(pj.breakdown.inssProLabore + pj.breakdown.irrfProLabore)}/mês</dd></div>
            <div><dt>Contador</dt><dd>{brlExato(pj.breakdown.contadorMensal)}/mês</dd></div>
            <div><dt>Líquido médio mensal</dt><dd>{brlExato(pj.mediaMensal)}</dd></div>
          </dl>
          <p className="nota">
            A calculadora escolheu {ROTULO_ESTRATEGIA[pj.estrategia]}. Fator R resultante:{' '}
            {pct(pj.fatorR * 100, 1)}.
          </p>
        </div>
      </div>
    </section>
  )
}

export function ResultadoPjParaClt({ eq }: { eq: EquivalenciaPjParaClt }) {
  const { pj, clt, salarioEquivalente } = eq
  return (
    <section className="resultado">
      <div className="cri-card-flat destaque">
        <p className="destaque-legenda">Esse faturamento PJ equivale a um salário CLT de</p>
        <p className="destaque-valor display"><CountUp valor={salarioEquivalente} formato={brl} /><span className="destaque-mes">/mês (bruto)</span></p>
        <p className="nota">
          Empate no líquido anual: {brlExato(pj.liquidoAnualTotal)} no ano. No CLT esse valor já viria com
          13º, férias com um terço, FGTS e a estabilidade do vínculo. No PJ, quem cobre isso é você. Uma
          proposta PJ que só empata costuma valer menos na prática.
        </p>
      </div>

      <div className="grade-2">
        <div className="cri-card-flat lado">
          <h3 className="display">Lado PJ</h3>
          <dl>
            <div><dt>Simples Nacional (Anexo {pj.anexo})</dt><dd>{brlExato(pj.breakdown.dasMensal)}/mês</dd></div>
            <div><dt>Pró-labore</dt><dd>{brlExato(pj.proLabore)}</dd></div>
            <div><dt>INSS + IRRF do pró-labore</dt><dd>{brlExato(pj.breakdown.inssProLabore + pj.breakdown.irrfProLabore)}/mês</dd></div>
            <div><dt>Contador</dt><dd>{brlExato(pj.breakdown.contadorMensal)}/mês</dd></div>
            <div><dt>Líquido médio mensal</dt><dd>{brlExato(pj.mediaMensal)}</dd></div>
          </dl>
          <p className="nota">
            Arranjo usado: {ROTULO_ESTRATEGIA[pj.estrategia]}. Fator R: {pct(pj.fatorR * 100, 1)}.
          </p>
        </div>
        <div className="cri-card-flat lado">
          <h3 className="display">Lado CLT equivalente</h3>
          <dl>
            <div><dt>Líquido em mês normal</dt><dd>{brlExato(clt.breakdown.liquidoMesNormal)}</dd></div>
            <div><dt>13º líquido</dt><dd>{brlExato(clt.breakdown.liquido13)}</dd></div>
            <div><dt>Mês de férias (com o terço)</dt><dd>{brlExato(clt.breakdown.liquidoMesFerias)}</dd></div>
            <div><dt>FGTS depositado no ano</dt><dd>{brlExato(clt.breakdown.fgtsAnual)}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}
