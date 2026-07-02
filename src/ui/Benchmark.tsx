import type { BenchmarkResult } from '../engine/benchmark'
import { brl, brlExato } from './formato'

const TEXTO_POSICAO = {
  abaixo: 'abaixo da faixa estimada para esse perfil. Pode ser espaço real de negociação.',
  dentro: 'dentro da faixa estimada para esse perfil.',
  acima: 'acima da faixa estimada para esse perfil. Bom sinal.',
} as const

export function Benchmark({ resultado }: { resultado: BenchmarkResult }) {
  const { faixaMin, faixaMax, estimativaCentral, valorComparado, posicao } = resultado

  const inicio = faixaMin * 0.75
  const fim = faixaMax * 1.25
  const posPct = (v: number) => Math.min(98, Math.max(2, ((v - inicio) / (fim - inicio)) * 100))

  return (
    <section className="cri-card-flat benchmark">
      <h3 className="display">Como esse valor se compara ao mercado</h3>
      <p>
        Seu valor bruto de {brl(valorComparado)} está <strong>{TEXTO_POSICAO[posicao]}</strong>
      </p>

      <div className="faixa-barra" role="img" aria-label={`Faixa estimada de ${brl(faixaMin)} a ${brl(faixaMax)}`}>
        <div
          className="faixa-preenchida"
          style={{ left: `${posPct(faixaMin)}%`, width: `${posPct(faixaMax) - posPct(faixaMin)}%` }}
        />
        <div className="faixa-marcador" style={{ left: `${posPct(valorComparado)}%` }} title={brl(valorComparado)} />
      </div>
      <div className="faixa-rotulos">
        <span>{brl(faixaMin)}</span>
        <span className="faixa-central">faixa estimada (centro: {brl(estimativaCentral)})</span>
        <span>{brl(faixaMax)}</span>
      </div>

      <details className="como-calculamos">
        <summary>Como calculamos essa faixa</summary>
        <p className="nota">
          A faixa é uma estimativa construída a partir dos agregados publicados pela{' '}
          <a href={resultado.fonte.url} target="_blank" rel="noreferrer">
            {resultado.fonte.fonte}
          </a>{' '}
          ({resultado.fonte.respondentes.toLocaleString('pt-BR')} respondentes). A pesquisa não publica o
          cruzamento exato do seu perfil, então partimos da média da senioridade e ajustamos por área, estado
          e tipo de vínculo. Estimativa honesta, não dado observado.
        </p>
        <ul>
          {resultado.fatores.map((f) => (
            <li key={f.chave}>
              {f.rotulo}:{' '}
              {f.chave === 'base-senioridade' ? (
                <strong>{brlExato(f.valor)}</strong>
              ) : (
                <>
                  <strong>×{f.valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</strong>{' '}
                  (média do recorte: {brlExato(f.referencia)}, média nacional:{' '}
                  {brlExato(resultado.mediaNacionalGeral)})
                </>
              )}
            </li>
          ))}
        </ul>
        {resultado.contexto.map((c) => (
          <p className="nota" key={c.rotulo}>
            <strong>{c.rotulo}:</strong> {c.texto}
          </p>
        ))}
        <p className="nota">Aplicamos ±15% em torno da estimativa central para formar a faixa.</p>
      </details>
    </section>
  )
}
