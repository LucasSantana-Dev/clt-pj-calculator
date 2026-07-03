import type { ColchaoInput, ColchaoResult } from '../engine/colchao'
import { brl, brlExato, pct } from './formato'
import { CampoNumero } from './CampoNumero'
import { CountUp } from './CountUp'

interface Props {
  resultado: ColchaoResult
  config: Required<ColchaoInput>
  aoMudar: (config: Required<ColchaoInput>) => void
}

const EXPLICACOES: Record<string, string> = {
  ferias: 'No CLT as férias são pagas. No PJ, mês sem faturar é mês sem receita. Este item recompõe o que você deixa de faturar tirando férias.',
  inatividade: 'Entre um contrato e outro pode haver semanas paradas. Uma reserva embutida no preço evita sufoco.',
  'plano-saude': 'Sem a empresa pagando, o plano de saúde sai do seu bolso.',
  previdencia: 'O PJ não tem FGTS nem multa de rescisão. Um aporte mensal de previdência ou investimento faz esse papel.',
}

export function Colchao({ resultado, config, aoMudar }: Props) {
  return (
    <section className="cri-card-flat colchao">
      <h3 className="display">Colchão de segurança</h3>
      <p className="nota">
        A equivalência pura empata os números, mas o CLT carrega proteções que o PJ não tem: férias pagas,
        seguro-desemprego, aviso prévio, multa do FGTS. O colchão coloca preço nisso, item por item. Ajuste
        como fizer sentido para a sua vida.
      </p>

      <div className="colchao-config grade-2">
        <CampoNumero
          id="colchao-ferias"
          rotulo="Semanas de férias por ano"
          valor={config.semanasFerias}
          aoMudar={(v) => aoMudar({ ...config, semanasFerias: v })}
          passo={1}
          max={12}
          mostrarZero
        />
        <CampoNumero
          id="colchao-inatividade"
          rotulo="Semanas paradas entre contratos"
          valor={config.semanasInatividade}
          aoMudar={(v) => aoMudar({ ...config, semanasInatividade: v })}
          passo={1}
          max={26}
          mostrarZero
        />
        <CampoNumero
          id="colchao-plano"
          rotulo="Plano de saúde por mês"
          valor={config.planoSaudeMensal}
          aoMudar={(v) => aoMudar({ ...config, planoSaudeMensal: v })}
          prefixo="R$"
          passo={50}
          mostrarZero
        />
        <CampoNumero
          id="colchao-previdencia"
          rotulo="Previdência por mês"
          valor={config.previdenciaMensal}
          aoMudar={(v) => aoMudar({ ...config, previdenciaMensal: v })}
          prefixo="R$"
          passo={50}
          mostrarZero
        />
      </div>

      <ul className="colchao-itens">
        {resultado.itens.map((item) => (
          <li key={item.chave}>
            <div className="colchao-item-topo">
              <span>{item.rotulo}</span>
              <strong>{brlExato(item.acrescimoMensal)}/mês</strong>
            </div>
            <p className="nota">{EXPLICACOES[item.chave]}</p>
          </li>
        ))}
      </ul>

      <div className="colchao-total">
        <p>
          Com colchão de {pct(resultado.percentual)} sobre a equivalência, o faturamento que sustenta a troca é
        </p>
        <p className="destaque-valor display">
          <CountUp valor={resultado.faturamentoRecomendado} formato={brl} />
          <span className="destaque-mes">/mês</span>
        </p>
      </div>
    </section>
  )
}
