import { Minus, Plus } from 'lucide-react'

interface Props {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  step?: number
  min?: number
  max?: number
  /** Exibe 0 em vez de campo vazio (bom para campos onde zero é escolha real). */
  showZero?: boolean
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  step = 100,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  showZero = false,
}: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const adjust = (delta: number) => onChange(clamp((value || 0) + delta))

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="number-field">
        {prefix && <span className="field-prefix">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={showZero ? value : value || ''}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        />
        <span className="stepper">
          <button
            type="button"
            aria-label={`Diminuir ${label}`}
            onClick={() => adjust(-step)}
            disabled={(value || 0) <= min}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Aumentar ${label}`} onClick={() => adjust(step)}>
            <Plus size={14} aria-hidden="true" />
          </button>
        </span>
      </div>
    </div>
  )
}
