/**
 * Basic scheduler to demonstrate usage
 */

export const name = 'basic'

export interface S {
  repetition: number
}

export function init(s: Partial<S> = {}): S {
  return { repetition: s.repetition || 0 }
}

export function filter({ repetition = 0 }: S): boolean {
  return repetition < 3
}

export function sort(sA: S, sB: S): number {
  init(sA)
  init(sB)
  return (sA.repetition - sB.repetition) || (Math.random() - 0.5)
}

export function update({ repetition }: S, quality: 0 | 1): S {
  return { repetition: quality ? repetition + 1 : repetition }
}

export default { name, init, filter, sort, update }
