export function fmtNumber(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('pt-BR').format(n)
}

export function fmtGP(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return `${fmtNumber(n)} gp`
}

export function toDate(input: string | number | Date | undefined | null): Date | null {
  if (input == null) return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input

  // número? pode ser seconds ou milliseconds
  if (typeof input === 'number') {
    const maybeMs = input > 10_000_000_000 ? input : input * 1000
    const d = new Date(maybeMs)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // string ISO?
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

export function fmtDateTime(input: string | number | Date | undefined | null) {
  const d = toDate(input)
  return d ? d.toLocaleString('pt-BR') : '—'
}
