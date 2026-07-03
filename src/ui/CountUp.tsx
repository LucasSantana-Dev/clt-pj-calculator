import { useEffect, useRef, useState } from 'react'

/**
 * Anima o número só na primeira aparição (ease-out, ~700ms); mudanças
 * seguintes atualizam direto para não virar ruído enquanto a pessoa digita.
 * Respeita prefers-reduced-motion.
 */
function useNumeroAnimado(alvo: number): number {
  const [valor, setValor] = useState(0)
  const jaMontado = useRef(false)

  useEffect(() => {
    if (jaMontado.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      jaMontado.current = true
      setValor(alvo)
      return
    }
    jaMontado.current = true
    const inicio = performance.now()
    const duracao = 700
    let raf = 0
    const passo = (t: number) => {
      const progresso = Math.min(1, (t - inicio) / duracao)
      const suavizado = 1 - Math.pow(1 - progresso, 3)
      setValor(alvo * suavizado)
      if (progresso < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [alvo])

  return valor
}

export function CountUp({ valor, formato }: { valor: number; formato: (v: number) => string }) {
  return <>{formato(useNumeroAnimado(valor))}</>
}
