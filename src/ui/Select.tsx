import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface Opcao<T extends string> {
  valor: T
  rotulo: string
}

interface Props<T extends string> {
  id: string
  valor: T
  opcoes: readonly Opcao<T>[]
  aoMudar: (v: T) => void
}

/**
 * Select customizado (padrão listbox): o <select> nativo não deixa estilizar a
 * lista de opções, então o menu aberto é nosso, com teclado e ARIA completos.
 */
export function Select<T extends string>({ id, valor, opcoes, aoMudar }: Props<T>) {
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(() => Math.max(0, opcoes.findIndex((o) => o.valor === valor)))
  const raizRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)
  const idLista = useId()

  const selecionada = opcoes.find((o) => o.valor === valor)

  useEffect(() => {
    if (!aberto) return
    const fechaFora = (e: PointerEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('pointerdown', fechaFora)
    return () => document.removeEventListener('pointerdown', fechaFora)
  }, [aberto])

  useEffect(() => {
    if (aberto) {
      const idx = opcoes.findIndex((o) => o.valor === valor)
      setAtivo(idx >= 0 ? idx : 0)
    }
  }, [aberto, opcoes, valor])

  useEffect(() => {
    if (!aberto) return
    listaRef.current
      ?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [aberto, ativo])

  const escolhe = (indice: number) => {
    aoMudar(opcoes[indice].valor)
    setAberto(false)
  }

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (!aberto && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setAberto(true)
      return
    }
    if (!aberto) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setAtivo((a) => Math.min(a + 1, opcoes.length - 1))
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
        setAtivo(opcoes.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        escolhe(ativo)
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
          const letra = e.key.toLowerCase()
          const inicio = (ativo + 1) % opcoes.length
          for (let passo = 0; passo < opcoes.length; passo++) {
            const i = (inicio + passo) % opcoes.length
            if (opcoes[i].rotulo.toLowerCase().startsWith(letra)) {
              setAtivo(i)
              break
            }
          }
        }
      }
    }
  }

  return (
    <div className="select" ref={raizRef}>
      <button
        type="button"
        id={id}
        className={`select-botao${aberto ? ' aberto' : ''}`}
        role="combobox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-haspopup="listbox"
        onClick={() => setAberto((a) => !a)}
        onKeyDown={aoTeclar}
      >
        <span>{selecionada?.rotulo}</span>
        <ChevronDown size={16} className="select-seta" aria-hidden="true" />
      </button>
      {aberto && (
        <ul className="select-lista" role="listbox" id={idLista} ref={listaRef} aria-labelledby={id}>
          {opcoes.map((o, i) => (
            <li
              key={o.valor}
              role="option"
              data-indice={i}
              aria-selected={o.valor === valor}
              className={`select-opcao${i === ativo ? ' ativa' : ''}${o.valor === valor ? ' escolhida' : ''}`}
              onPointerMove={() => setAtivo(i)}
              onClick={() => escolhe(i)}
            >
              <span>{o.rotulo}</span>
              {o.valor === valor && <Check size={14} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
