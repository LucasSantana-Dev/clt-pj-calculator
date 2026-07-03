import { useEffect, useRef, useState } from 'react'
import type { SeriesPoint, Trends as TrendsData } from '../engine/trends'
import { brl, pct } from './format'

/**
 * Gráficos de linha das edições 2021-2026.
 * Paleta validada (dark, superfície #050202): contraste PASS; separação CVD
 * ciano×rosa fica na faixa-piso (ΔE 9,2 deutan), então a identidade das séries
 * nunca depende só de cor: rótulo direto no fim de cada linha + legenda + tabela.
 */

interface Series {
  name: string
  color: string
  points: SeriesPoint[]
}

interface LineChartProps {
  series: Series[]
  format: (v: number) => string
  height?: number
}

const WIDTH = 520
const MARGIN = { topo: 26, dir: 64, baixo: 24, esq: 18 }

function LineChart({ series, format, height = 190 }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const years = series[0].points.map((p) => p.year)
  const allValues = series.flatMap((s) => s.points.map((p) => p.value))
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const padding = (max - min || 1) * 0.12

  const x = (i: number) =>
    MARGIN.esq + (i / (years.length - 1)) * (WIDTH - MARGIN.esq - MARGIN.dir)
  const y = (v: number) =>
    height - MARGIN.baixo - ((v - (min - padding)) / (max + padding - (min - padding))) * (height - MARGIN.topo - MARGIN.baixo)

  const gridValues = [0.25, 0.5, 0.75].map((t) => min - padding + t * (max + padding - (min - padding)))

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH
    let best = 0
    for (let i = 1; i < years.length; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    setHover(best)
  }

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="chart"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={series.map((s) => s.name).join(' e ')}
      >
        {gridValues.map((v) => (
          <line key={v} x1={MARGIN.esq} x2={WIDTH - MARGIN.dir} y1={y(v)} y2={y(v)} className="chart-gridline" />
        ))}

        {years.map((year, i) => (
          <text key={year} x={x(i)} y={height - 6} className="year-tick" textAnchor="middle">
            {String(year).slice(2)}
          </text>
        ))}

        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={MARGIN.topo - 8} y2={height - MARGIN.baixo} className="crosshair" />
        )}

        {series.map((s) => {
          const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
          const last = s.points[s.points.length - 1]
          return (
            <g key={s.name}>
              <path
                d={d}
                pathLength={1}
                className="series-line"
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.points.map((p, i) => (
                <circle
                  key={p.year}
                  cx={x(i)}
                  cy={y(p.value)}
                  r={hover === i ? 4.5 : 2.5}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              ))}
              {/* rótulo direto: identidade nunca só por cor */}
              <text x={x(s.points.length - 1) + 10} y={y(last.value) + 4} className="series-label" textAnchor="start">
                {s.name}
              </text>
              {/* rótulos seletivos: primeiro e último ponto */}
              <text x={x(0)} y={y(s.points[0].value) - 9} className="value-label" textAnchor="start">
                {format(s.points[0].value)}
              </text>
              <text x={x(s.points.length - 1)} y={y(last.value) - 9} className="value-label" textAnchor="end">
                {format(last.value)}
              </text>
            </g>
          )
        })}
      </svg>

      {hover != null && (
        <div className="chart-tooltip" style={{ left: `${(x(hover) / WIDTH) * 100}%` }}>
          <span className="tooltip-year">{years[hover]}</span>
          {series.map((s) => (
            <span key={s.name} className="tooltip-row">
              <i style={{ background: s.color }} />
              {s.name}: <strong>{format(s.points[hover].value)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function Trends({ data }: { data: TrendsData }) {
  const currentPremium = data.pjPremiumSeries[data.pjPremiumSeries.length - 1]
  const peakPremium = data.pjPremiumSeries.reduce((a, b) => (b.value > a.value ? b : a))

  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisivel] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`cri-card-flat trends${visible ? ' visible' : ''}`}>
      <h3 className="display">Para onde o mercado está indo</h3>
      <p className="note">
        Séries das seis edições da{' '}
        <a href="https://pesquisa.codigofonte.com.br" target="_blank" rel="noreferrer">
          Pesquisa Código Fonte TV
        </a>{' '}
        (2021 a 2026), em valores nominais.
      </p>

      <div className="charts">
        <div className="trend-block">
          <div className="chart-header">
            <h4>Média salarial por vínculo</h4>
            <span className="legend">
              <span><i className="chip" style={{ background: 'var(--cyan)' }} />CLT</span>
              <span><i className="chip" style={{ background: 'var(--accent)' }} />PJ</span>
            </span>
          </div>
          <LineChart
            format={brl}
            series={[
              { name: 'CLT', color: 'var(--cyan)', points: data.cltSeries },
              { name: 'PJ', color: 'var(--accent)', points: data.pjSeries },
            ]}
          />
          <p className="note">
            CLT crescendo {pct(data.cltCagr)} ao ano; PJ, {pct(data.pjCagr)}. As linhas estão se
            aproximando.
          </p>
        </div>

        <div className="trend-block">
          <div className="chart-header">
            <h4>Prêmio PJ sobre CLT</h4>
          </div>
          <LineChart
            format={(v) => pct(v, 0)}
            series={[{ name: 'prêmio', color: 'var(--gold)', points: data.pjPremiumSeries }]}
          />
          <p className="note">
            Do pico de {pct(peakPremium.value, 0)} em {peakPremium.year} para {pct(currentPremium.value, 0)} em{' '}
            {currentPremium.year}.
          </p>
        </div>
      </div>

      <p className="takeaway">
        A leitura: o salário CLT vem subindo mais rápido que o faturamento PJ, e a vantagem histórica do PJ
        está encolhendo. Isso torna o colchão de segurança ainda mais importante na hora de precificar uma
        proposta PJ, porque a margem que compensava o risco já foi bem maior.
      </p>
      {data.senioritySeries.length >= 2 && data.seniorityCagr != null && (
        <p className="note">
          Para a sua senioridade, a média de mercado cresceu {pct(data.seniorityCagr)} ao ano no período
          coberto pelas edições.
        </p>
      )}

      <details className="data-table">
        <summary>Ver os dados em tabela</summary>
        <table>
          <thead>
            <tr><th>Ano</th><th>Média CLT</th><th>Média PJ</th><th>Prêmio PJ</th></tr>
          </thead>
          <tbody>
            {data.cltSeries.map((p, i) => (
              <tr key={p.year}>
                <td>{p.year}</td>
                <td>{brl(p.value)}</td>
                <td>{brl(data.pjSeries[i].value)}</td>
                <td>{pct(data.pjPremiumSeries[i].value, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
