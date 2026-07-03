import type { BenchmarkResult } from '../engine/benchmark'
import { brl, brlExact } from './format'

const POSITION_TEXT = {
  below: 'below da faixa estimada para esse perfil. Pode ser espaço real de negociação.',
  within: 'within da faixa estimada para esse perfil.',
  above: 'above da faixa estimada para esse perfil. Bom sinal.',
} as const

export function Benchmark({ result }: { result: BenchmarkResult }) {
  const { rangeMin, rangeMax, centralEstimate, comparedValue, position } = result

  const start = rangeMin * 0.75
  const end = rangeMax * 1.25
  const posPct = (v: number) => Math.min(98, Math.max(2, ((v - start) / (end - start)) * 100))

  return (
    <section className="cri-card-flat benchmark">
      <h3 className="display">Como esse valor se compara ao mercado</h3>
      <p>
        Seu valor bruto de {brl(comparedValue)} está <strong>{POSITION_TEXT[position]}</strong>
      </p>

      <div
        className="range-area"
        role="img"
        aria-label={`Faixa estimada de ${brl(rangeMin)} a ${brl(rangeMax)}, centro ${brl(centralEstimate)}; seu valor: ${brl(comparedValue)}`}
      >
        <div
          className="you-chip"
          style={{ left: `${posPct(comparedValue)}%` }}
          data-edge={posPct(comparedValue) < 14 ? 'left' : posPct(comparedValue) > 86 ? 'right' : undefined}
        >
          você: {brl(comparedValue)}
        </div>
        <div className="range-bar">
          <div
            className="range-band"
            style={{ left: `${posPct(rangeMin)}%`, width: `${posPct(rangeMax) - posPct(rangeMin)}%` }}
          />
          <div className="range-center" style={{ left: `${posPct(centralEstimate)}%` }} />
          <div className="range-marker" style={{ left: `${posPct(comparedValue)}%` }} />
        </div>
        <div className="range-labels">
          <span className="range-bound" style={{ left: `${posPct(rangeMin)}%` }}>
            {brl(rangeMin)}
          </span>
          <span className="range-bound range-bound-center" style={{ left: `${posPct(centralEstimate)}%` }}>
            centro
            <br />
            {brl(centralEstimate)}
          </span>
          <span className="range-bound" style={{ left: `${posPct(rangeMax)}%` }}>
            {brl(rangeMax)}
          </span>
        </div>
      </div>
      <p className="range-caption note">
        A área roxa é a faixa estimada para o seu profile; o marcador rosa é o valor que você informou.
      </p>

      <details className="how-we-calculate">
        <summary>Como calculamos essa faixa</summary>
        <p className="note">
          A faixa é uma estimativa construída a partir dos agregados publicados pela{' '}
          <a href={result.source.url} target="_blank" rel="noreferrer">
            {result.source.source}
          </a>{' '}
          ({result.source.respondents.toLocaleString('pt-BR')} respondents). A pesquisa não publica o
          cruzamento exato do seu profile, então partimos da média da senioridade e ajustamos por área, estado
          e tipo de vínculo. Estimativa honesta, não dado observado.
        </p>
        <ul>
          {result.factors.map((f) => (
            <li key={f.key}>
              {f.label}:{' '}
              {f.key === 'seniority-base' ? (
                <strong>{brlExact(f.value)}</strong>
              ) : (
                <>
                  <strong>×{f.value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</strong>{' '}
                  (média do recorte: {brlExact(f.reference)}, média national:{' '}
                  {brlExact(result.nationalAverage)})
                </>
              )}
            </li>
          ))}
        </ul>
        {result.context.map((c) => (
          <p className="note" key={c.label}>
            <strong>{c.label}:</strong> {c.text}
          </p>
        ))}
        <p className="note">Aplicamos ±15% em torno da estimativa central para formar a bracket.</p>
      </details>
    </section>
  )
}
