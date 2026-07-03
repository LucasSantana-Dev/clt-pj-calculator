import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  id: string
  value: T
  options: readonly SelectOption<T>[]
  onChange: (v: T) => void
}

/**
 * Select customizado (padrão listbox): o <select> nativo não deixa estilizar a
 * lista de opções, então o menu aberto é nosso, com teclado e ARIA completos.
 */
export function Select<T extends string>({ id, value, options, onChange }: Props<T>) {
  const [open, setAberto] = useState(false)
  const [activeIndex, setAtivo] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)))
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value)
      setAtivo(idx >= 0 ? idx : 0)
    }
  }, [open, options, value])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const choose = (index: number) => {
    onChange(options[index].value)
    setAberto(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setAberto(true)
      return
    }
    if (!open) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setAtivo((a) => Math.min(a + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setAtivo((a) => Math.max(a - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setAtivo(0)
        break
      case 'End':
        e.preventDefault()
        setAtivo(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        setAberto(false)
        break
      case 'Tab':
        setAberto(false)
        break
      default: {
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const letter = e.key.toLowerCase()
          const start = (activeIndex + 1) % options.length
          for (let step = 0; step < options.length; step++) {
            const i = (start + step) % options.length
            if (options[i].label.toLowerCase().startsWith(letter)) {
              setAtivo(i)
              break
            }
          }
        }
      }
    }
  }

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`select-button${open ? ' open' : ''}`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setAberto((a) => !a)}
        onKeyDown={handleKey}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={16} className="select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="select-list" role="listbox" id={listId} ref={listRef} aria-labelledby={id}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              data-index={i}
              aria-selected={o.value === value}
              className={`select-option${i === activeIndex ? ' active' : ''}${o.value === value ? ' selected' : ''}`}
              onPointerMove={() => setAtivo(i)}
              onClick={() => choose(i)}
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={14} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
