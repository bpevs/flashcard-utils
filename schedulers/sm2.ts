/**
 * Supermemo2 Algorithm
 * @reference https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * @reference https://super-memory.com/english/ol/sm2.htm
 */
const EF = 2.5
const REPETITION = 0
const INTERVAL = 0
export const name = 'sm2'

export default { name, init, filter, sort, update }

export interface S {
  interval?: number
  repetition?: number
  efactor?: number
  lastStudied?: Date
}

export function init({ efactor, repetition, interval }: S = {}): S {
  return {
    efactor: efactor ?? EF,
    repetition: repetition ?? REPETITION,
    interval: interval ?? INTERVAL,
  }
}

export function filter(s: S = {}): boolean {
  const due = getDueDate(s)
  return !due || (due <= new Date())
}

export function sort(sA: S = {}, sB: S = {}) {
  init(sA)
  init(sB)
  const aDue = getDueDate(sA)
  const bDue = getDueDate(sB)
  if (!aDue && bDue) return -1
  if (!bDue && aDue) return 1
  if (!aDue || !bDue) return (Math.random() - 0.5)
  if (sameDay(aDue, bDue)) return (Math.random() - 0.5)
  return (aDue.getDate() - bDue.getDate())
}

export function update({
  efactor: prevEfactor = EF,
  repetition: prevRepetition = REPETITION,
  interval: prevInterval = INTERVAL,
  lastStudied: prevLastStudied,
}: S = {}, quality: 0 | 1 | 2 | 3 | 4 | 5): S {
  const efactorModifier = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const efactor = Math.max(1.3, prevEfactor + efactorModifier)
  const lastStudied = new Date()

  if (quality < 4) {
    const studiedToday = sameDay(prevLastStudied || lastStudied, lastStudied)
    return {
      efactor: (quality < 3) ? prevEfactor : efactor,
      lastStudied,
      interval: studiedToday ? 0 : Math.min(1, prevInterval),
      repetition: 0,
    }
  } else if (prevRepetition === 0) {
    return { efactor, lastStudied, interval: 1, repetition: 1 }
  } else if (prevRepetition === 1) {
    return { efactor, lastStudied, interval: 6, repetition: 2 }
  } else {
    return {
      efactor,
      lastStudied,
      interval: Math.round(prevInterval * prevEfactor),
      repetition: prevRepetition + 1,
    }
  }
}

function getDueDate(s: S): Date | null {
  if (!s.lastStudied) return null
  const due = new Date(s.lastStudied)
  due.setDate(due.getDate() + (s.interval ?? INTERVAL))
  return due
}

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}
