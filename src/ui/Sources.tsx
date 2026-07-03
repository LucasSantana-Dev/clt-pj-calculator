import history from '../data/history2021to2026.json'
import benchmark from '../data/benchmark2026.json'

const SURVEY_BASE = 'https://pesquisa.codigofonte.com.br'

export function Sources() {
  return (
    <section className="cri-card-flat sources">
      <h3 className="display">Fontes dos dados de mercado</h3>
      <p className="note">
        As faixas e tendências desta calculadora vêm da{' '}
        <a href={SURVEY_BASE} target="_blank" rel="noreferrer">
          Pesquisa Código Fonte TV
        </a>
        , a maior pesquisa salarial de tecnologia do Brasil, feita pela comunidade do canal{' '}
        <a href="https://www.youtube.com/@codigofontetv" target="_blank" rel="noreferrer">
          Código Fonte TV
        </a>
        . Usamos os agregados publicados de todas as edições, sempre citando edição e data. A edição de{' '}
        2026 ({benchmark.meta.respondents.toLocaleString('pt-BR')} pessoas respondentes) alimenta a faixa
        estimada; a série 2021 a 2026 alimenta a leitura de tendências.
      </p>
      <ul className="sources-editions">
        {history.editions.map((e) => (
          <li key={e.year}>
            <a href={`${SURVEY_BASE}/${e.year}`} target="_blank" rel="noreferrer">
              Edição {e.year}
            </a>
            <span className="note">{e.respondents.toLocaleString('pt-BR')} respondentes</span>
          </li>
        ))}
      </ul>
      <p className="note">
        Os valores por área e por experiência são estimativas calculadas a partir das distribuições por
        faixa salarial publicadas (ponto médio ponderado por respondentes). Os parâmetros fiscais de 2026
        (INSS, IRRF com a Lei 15.270, Simples Nacional) vêm das tabelas oficiais em gov.br.
      </p>
    </section>
  )
}
