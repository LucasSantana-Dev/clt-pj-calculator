import { Minus, Plus } from 'lucide-react'

interface Props {
  id: string
  rotulo: string
  valor: number
  aoMudar: (v: number) => void
  prefixo?: string
  passo?: number
  min?: number
  max?: number
  /** Exibe 0 em vez de campo vazio (bom para campos onde zero é escolha real). */
  mostrarZero?: boolean
}

export function CampoNumero({
  id,
  rotulo,
  valor,
  aoMudar,
  prefixo,
  passo = 100,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  mostrarZero = false,
}: Props) {
  const limita = (v: number) => Math.min(max, Math.max(min, v))
  const ajusta = (delta: number) => aoMudar(limita((valor || 0) + delta))

  return (
    <div className="campo">
      <label className="campo-rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <div className="campo-num">
        {prefixo && <span className="campo-prefixo">{prefixo}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={passo}
          value={mostrarZero ? valor : valor || ''}
          onChange={(e) => aoMudar(limita(Number(e.target.value) || 0))}
        />
        <span className="stepper">
          <button
            type="button"
            aria-label={`Diminuir ${rotulo}`}
            onClick={() => ajusta(-passo)}
            disabled={(valor || 0) <= min}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <button type="button" aria-label={`Aumentar ${rotulo}`} onClick={() => ajusta(passo)}>
            <Plus size={14} aria-hidden="true" />
          </button>
        </span>
      </div>
    </div>
  )
}
