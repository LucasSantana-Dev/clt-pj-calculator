import { useEffect, useRef, useState } from 'react'
import type { PontoSerie, Tendencias as TendenciasData } from '../engine/tendencias'
import { brl, pct } from './formato'

/**
 * Gráficos de linha das edições 2021-2026.
 * Paleta validada (dark, superfície #050202): contraste PASS; separação CVD
 * ciano×rosa fica na faixa-piso (ΔE 9,2 deutan), então a identidade das séries
 * nunca depende só de cor: rótulo direto no fim de cada linha + legenda + tabela.
 */

interface Serie {
  nome: string
  cor: string
  pontos: PontoSerie[]
}

interface GraficoLinhaProps {
  series: Serie[]
  formato: (v: number) => string
  altura?: number
}

const LARGURA = 520
const MARGEM = { topo: 26, dir: 64, baixo: 24, esq: 18 }

function GraficoLinha({ series, formato, altura = 190 }: GraficoLinhaProps) {
  const [hover, setHover] = useState<number | null>(null)

  const anos = series[0].pontos.map((p) => p.ano)
  const todos = series.flatMap((s) => s.pontos.map((p) => p.valor))
  const min = Math.min(...todos)
  const max = Math.max(...todos)
  const folga = (max - min || 1) * 0.12

  const x = (i: number) =>
    MARGEM.esq + (i / (anos.length - 1)) * (LARGURA - MARGEM.esq - MARGEM.dir)
  const y = (v: number) =>
    altura - MARGEM.baixo - ((v - (min - folga)) / (max + folga - (min - folga))) * (altura - MARGEM.topo - MARGEM.baixo)

  const grades = [0.25, 0.5, 0.75].map((t) => min - folga + t * (max + folga - (min - folga)))

  const aoMover = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * LARGURA
    let melhor = 0
    for (let i = 1; i < anos.length; i++) if (Math.abs(x(i) - px) < Math.abs(x(melhor) - px)) melhor = i
    setHover(melhor)
  }

  return (
    <div className="grafico-envolto">
      <svg
        viewBox={`0 0 ${LARGURA} ${altura}`}
        className="grafico"
        onMouseMove={aoMover}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={series.map((s) => s.nome).join(' e ')}
      >
        {grades.map((v) => (
          <line key={v} x1={MARGEM.esq} x2={LARGURA - MARGEM.dir} y1={y(v)} y2={y(v)} className="grade-linha" />
        ))}

        {anos.map((ano, i) => (
          <text key={ano} x={x(i)} y={altura - 6} className="tick-ano" textAnchor="middle">
            {String(ano).slice(2)}
          </text>
        ))}

        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={MARGEM.topo - 8} y2={altura - MARGEM.baixo} className="crosshair" />
        )}

        {series.map((s) => {
          const d = s.pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ')
          const ultimo = s.pontos[s.pontos.length - 1]
          return (
            <g key={s.nome}>
              <path
                d={d}
                pathLength={1}
                className="linha-serie"
                fill="none"
                stroke={s.cor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.pontos.map((p, i) => (
                <circle
                  key={p.ano}
                  cx={x(i)}
                  cy={y(p.valor)}
                  r={hover === i ? 4.5 : 2.5}
                  fill={s.cor}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              ))}
              {/* rótulo direto: identidade nunca só por cor */}
              <text x={x(s.pontos.length - 1) + 10} y={y(ultimo.valor) + 4} className="rotulo-serie" textAnchor="start">
                {s.nome}
              </text>
              {/* rótulos seletivos: primeiro e último ponto */}
              <text x={x(0)} y={y(s.pontos[0].valor) - 9} className="rotulo-valor" textAnchor="start">
                {formato(s.pontos[0].valor)}
              </text>
              <text x={x(s.pontos.length - 1)} y={y(ultimo.valor) - 9} className="rotulo-valor" textAnchor="end">
                {formato(ultimo.valor)}
              </text>
            </g>
          )
        })}
      </svg>

      {hover != null && (
        <div className="grafico-tooltip" style={{ left: `${(x(hover) / LARGURA) * 100}%` }}>
          <span className="tooltip-ano">{anos[hover]}</span>
          {series.map((s) => (
            <span key={s.nome} className="tooltip-linha">
              <i style={{ background: s.cor }} />
              {s.nome}: <strong>{formato(s.pontos[hover].valor)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function Tendencias({ dados }: { dados: TendenciasData }) {
  const premioAtual = dados.seriePremioPj[dados.seriePremioPj.length - 1]
  const premioPico = dados.seriePremioPj.reduce((a, b) => (b.valor > a.valor ? b : a))

  const secaoRef = useRef<HTMLElement>(null)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = secaoRef.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true)
          observador.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return (
    <section ref={secaoRef} className={`cri-card-flat tendencias${visivel ? ' visivel' : ''}`}>
      <h3 className="display">Para onde o mercado está indo</h3>
      <p className="nota">Séries das seis edições da pesquisa (2021 a 2026), em valores nominais.</p>

      <div className="graficos">
        <div className="tendencia-bloco">
          <div className="grafico-cabecalho">
            <h4>Média salarial por vínculo</h4>
            <span className="legenda">
              <span><i className="chip" style={{ background: 'var(--cyan)' }} />CLT</span>
              <span><i className="chip" style={{ background: 'var(--accent)' }} />PJ</span>
            </span>
          </div>
          <GraficoLinha
            formato={brl}
            series={[
              { nome: 'CLT', cor: 'var(--cyan)', pontos: dados.serieClt },
              { nome: 'PJ', cor: 'var(--accent)', pontos: dados.seriePj },
            ]}
          />
          <p className="nota">
            CLT crescendo {pct(dados.cagrClt)} ao ano; PJ, {pct(dados.cagrPj)}. As linhas estão se
            aproximando.
          </p>
        </div>

        <div className="tendencia-bloco">
          <div className="grafico-cabecalho">
            <h4>Prêmio PJ sobre CLT</h4>
          </div>
          <GraficoLinha
            formato={(v) => pct(v, 0)}
            series={[{ nome: 'prêmio', cor: 'var(--gold)', pontos: dados.seriePremioPj }]}
          />
          <p className="nota">
            Do pico de {pct(premioPico.valor, 0)} em {premioPico.ano} para {pct(premioAtual.valor, 0)} em{' '}
            {premioAtual.ano}.
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

      <details className="tabela-dados">
        <summary>Ver os dados em tabela</summary>
        <table>
          <thead>
            <tr><th>Ano</th><th>Média CLT</th><th>Média PJ</th><th>Prêmio PJ</th></tr>
          </thead>
          <tbody>
            {dados.serieClt.map((p, i) => (
              <tr key={p.ano}>
                <td>{p.ano}</td>
                <td>{brl(p.valor)}</td>
                <td>{brl(dados.seriePj[i].valor)}</td>
                <td>{pct(dados.seriePremioPj[i].valor, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
