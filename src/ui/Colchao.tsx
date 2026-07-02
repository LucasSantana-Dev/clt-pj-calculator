import type { ColchaoInput, ColchaoResult } from '../engine/colchao'
import { brl, brlExato, pct } from './formato'

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
        <label className="campo">
          <span className="campo-rotulo">Semanas de férias por ano</span>
          <input
            type="number"
            min={0}
            max={12}
            value={config.semanasFerias}
            onChange={(e) => aoMudar({ ...config, semanasFerias: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="campo">
          <span className="campo-rotulo">Semanas paradas entre contratos</span>
          <input
            type="number"
            min={0}
            max={26}
            value={config.semanasInatividade}
            onChange={(e) => aoMudar({ ...config, semanasInatividade: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="campo">
          <span className="campo-rotulo">Plano de saúde por mês (R$)</span>
          <input
            type="number"
            min={0}
            step={50}
            value={config.planoSaudeMensal}
            onChange={(e) => aoMudar({ ...config, planoSaudeMensal: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="campo">
          <span className="campo-rotulo">Previdência por mês (R$)</span>
          <input
            type="number"
            min={0}
            step={50}
            value={config.previdenciaMensal}
            onChange={(e) => aoMudar({ ...config, previdenciaMensal: Number(e.target.value) || 0 })}
          />
        </label>
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
          {brl(resultado.faturamentoRecomendado)}
          <span className="destaque-mes">/mês</span>
        </p>
      </div>
    </section>
  )
}
