import { useEffect, useRef, useState } from 'react'

/**
 * Anima o número só na primeira aparição (ease-out, ~700ms); mudanças
 * seguintes atualizam direto para não virar ruído enquanto a pessoa digita.
 * Respeita prefers-reduced-motion.
 */
function useAnimatedNumber(target: number): number {
  const [value, setValor] = useState(0)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mountedRef.current = true
      setValor(target)
      return
    }
    mountedRef.current = true
    const start = performance.now()
    const duration = 700
    let raf = 0
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValor(target * eased)
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return value
}

export function CountUp({ value, format }: { value: number; format: (v: number) => string }) {
  return <>{format(useAnimatedNumber(value))}</>
}
