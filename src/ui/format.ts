export function brl(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function brlExact(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function pct(v: number, casas = 1): string {
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: casas })}%`
}
