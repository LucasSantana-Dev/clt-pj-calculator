import type { CushionInput, CushionResult } from '../engine/cushion'
import { brl, brlExact, pct } from './format'
import { NumberField } from './NumberField'
import { CountUp } from './CountUp'

interface Props {
  result: CushionResult
  config: Required<CushionInput>
  onChange: (config: Required<CushionInput>) => void
}

const EXPLANATIONS: Record<string, string> = {
  ferias: 'No CLT as férias são pagas. No PJ, mês sem faturar é mês sem receita. Este item recompõe o que você deixa de faturar tirando férias.',
  inatividade: 'Entre um contrato e outro pode haver semanas paradas. Uma reserva embutida no preço evita sufoco.',
  'health-plan': 'Sem a empresa pagando, o plano de saúde sai do seu bolso.',
  previdencia: 'O PJ não tem FGTS nem multa de rescisão. Um aporte mensal de previdência ou investimento faz esse papel.',
}

export function Cushion({ result, config, onChange }: Props) {
  return (
    <section className="cri-card-flat cushion">
      <h3 className="display">Colchão de segurança</h3>
      <p className="note">
        A equivalência pura empata os números, mas o CLT carrega proteções que o PJ não tem: férias pagas,
        seguro-desemprego, aviso prévio, multa do FGTS. O colchão coloca preço nisso, item por item. Ajuste
        como fizer sentido para a sua vida.
      </p>

      <div className="cushion-config grid-2">
        <NumberField
          id="cushion-vacation"
          label="Semanas de férias por ano"
          value={config.vacationWeeks}
          onChange={(v) => onChange({ ...config, vacationWeeks: v })}
          step={1}
          max={12}
          showZero
        />
        <NumberField
          id="cushion-idle"
          label="Semanas paradas entre contratos"
          value={config.idleWeeks}
          onChange={(v) => onChange({ ...config, idleWeeks: v })}
          step={1}
          max={26}
          showZero
        />
        <NumberField
          id="cushion-health"
          label="Plano de saúde por mês"
          value={config.monthlyHealthPlan}
          onChange={(v) => onChange({ ...config, monthlyHealthPlan: v })}
          prefix="R$"
          step={50}
          showZero
        />
        <NumberField
          id="cushion-pension"
          label="Previdência por mês"
          value={config.monthlyPension}
          onChange={(v) => onChange({ ...config, monthlyPension: v })}
          prefix="R$"
          step={50}
          showZero
        />
      </div>

      <ul className="cushion-items">
        {result.items.map((item) => (
          <li key={item.key}>
            <div className="cushion-item-top">
              <span>{item.label}</span>
              <strong>{brlExact(item.monthlyAddition)}/mês</strong>
            </div>
            <p className="note">{EXPLANATIONS[item.key]}</p>
          </li>
        ))}
      </ul>

      <div className="cushion-total">
        <p>
          Com colchão de {pct(result.percentage)} sobre a equivalência, o faturamento que sustenta a troca é
        </p>
        <p className="highlight-value display">
          <CountUp value={result.recommendedRevenue} format={brl} />
          <span className="highlight-unit">/mês</span>
        </p>
      </div>
    </section>
  )
}
