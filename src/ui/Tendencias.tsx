import type { PontoSerie, Tendencias as TendenciasData } from '../engine/tendencias'
import { pct } from './formato'

function Sparkline({ serie, cor }: { serie: PontoSerie[]; cor: string }) {
  const largura = 220
  const altura = 56
  const min = Math.min(...serie.map((p) => p.valor))
  const max = Math.max(...serie.map((p) => p.valor))
  const x = (i: number) => (i / (serie.length - 1)) * (largura - 8) + 4
  const y = (v: number) => altura - 6 - ((v - min) / (max - min || 1)) * (altura - 12)
  const d = serie.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="sparkline" aria-hidden="true">
      <path d={d} fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={x(serie.length - 1)} cy={y(serie[serie.length - 1].valor)} r="3.5" fill={cor} />
    </svg>
  )
}

export function Tendencias({ dados }: { dados: TendenciasData }) {
  const premioAtual = dados.seriePremioPj[dados.seriePremioPj.length - 1]
  const premioPico = dados.seriePremioPj.reduce((a, b) => (b.valor > a.valor ? b : a))

  return (
    <section className="cri-card-flat tendencias">
      <h3 className="display">Para onde o mercado está indo</h3>
      <p className="nota">
        Séries das seis edições da pesquisa (2021 a 2026), em valores nominais.
      </p>
      <div className="grade-3">
        <div className="tendencia-bloco">
          <h4>Média CLT</h4>
          <Sparkline serie={dados.serieClt} cor="var(--cyan)" />
          <p className="nota">crescendo {pct(dados.cagrClt)} ao ano desde 2021</p>
        </div>
        <div className="tendencia-bloco">
          <h4>Média PJ</h4>
          <Sparkline serie={dados.seriePj} cor="var(--accent)" />
          <p className="nota">crescendo {pct(dados.cagrPj)} ao ano desde 2021</p>
        </div>
        <div className="tendencia-bloco">
          <h4>Prêmio PJ sobre CLT</h4>
          <Sparkline serie={dados.seriePremioPj} cor="var(--gold)" />
          <p className="nota">
            do pico de {pct(premioPico.valor, 0)} em {premioPico.ano} para {pct(premioAtual.valor, 0)} em{' '}
            {premioAtual.ano}
          </p>
        </div>
      </div>
      <p className="leitura">
        A leitura: o salário CLT vem subindo mais rápido que o faturamento PJ, e a vantagem histórica do PJ
        está encolhendo. Isso torna o colchão de segurança ainda mais importante na hora de precificar uma
        proposta PJ, porque a margem que compensava o risco já foi bem maior.
      </p>
      {dados.serieSenioridade.length >= 2 && dados.cagrSenioridade != null && (
        <p className="nota">
          Para a sua senioridade, a média de mercado cresceu {pct(dados.cagrSenioridade)} ao ano no período
          coberto pelas edições.
        </p>
      )}
    </section>
  )
}
