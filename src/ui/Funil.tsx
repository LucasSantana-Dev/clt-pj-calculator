import type { Senioridade } from '../engine/benchmark'
import { DISCORD, GUIAS_POR_SENIORIDADE, SITE } from './opcoes'

export function Funil({ senioridade }: { senioridade: Senioridade }) {
  const guias = GUIAS_POR_SENIORIDADE[senioridade]
  return (
    <section className="funil">
      <h3 className="display">Para continuar de onde a calculadora para</h3>
      <div className="grade-3">
        {guias.map((g) => (
          <a key={g.slug} className="cri-card guia-card" href={`${SITE}/guias/${g.slug}`} target="_blank" rel="noreferrer">
            <h4>{g.titulo}</h4>
            <p className="nota">{g.descricao}</p>
          </a>
        ))}
      </div>
      <div className="cri-card-flat discord-cta">
        <p>
          Dúvidas sobre uma proposta que você recebeu? Na comunidade tem gente que já passou por essa
          decisão e ajuda com calma.
        </p>
        <a className="cri-btn cri-btn-primary" href={DISCORD} target="_blank" rel="noreferrer">
          Entrar no Discord da Criativaria
        </a>
      </div>
    </section>
  )
}
