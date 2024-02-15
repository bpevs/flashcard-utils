/**
 * Supermemo2 Algorithm
 * @reference https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * @reference https://super-memory.com/english/ol/sm2.htm
 */

import Card, { Scheduling } from '../models/card.ts'

const EF = 2.5
const REPETITION = 0
const INTERVAL = 0

export interface sm2Scheduling extends Scheduling {
  interval: number
  repetition: number
  efactor: number
  lastStudied: Date
}

export function init(card: Card): Card {
  card.scheduling.efactor = card.scheduling.efactor ?? EF
  card.scheduling.repetition = card.scheduling.repetition ?? REPETITION
  card.scheduling.interval = card.scheduling.interval ?? INTERVAL
  return card
}

export function filter(card: Card): boolean {
  const due = getDue(card)
  return !due || (due <= new Date())
}

function getDue(card: Card): Date | null {
  if (!card.scheduling.lastStudied) return null
  const due = new Date(card.scheduling.lastStudied)
  due.setDate(due.getDate() + (card.scheduling.interval ?? INTERVAL))
  return due
}

export function sort(cardA: Card, cardB: Card) {
  init(cardA)
  init(cardB)
  const a = cardA.scheduling
  const b = cardB.scheduling
  const aDue = getDue(cardA)
  const bDue = getDue(cardB)
  if (!aDue && bDue) return -1
  if (!bDue && aDue) return 1

  return (aDue && bDue && (aDue.getDate() - bDue.getDate())) ||
    ((a.interval ?? INTERVAL) - (b.interval ?? INTERVAL)) ||
    ((a.repetition ?? REPETITION) - (b.repetition ?? REPETITION)) ||
    ((a.efactor ?? EF) - (b.efactor ?? EF)) ||
    0
}

export function update(
  prev: Scheduling,
  q: 0 | 1 | 2 | 3 | 4 | 5,
): sm2Scheduling {
  const { efactor: prevEfactor = EF, repetition = REPETITION } = prev
  const lastStudied = new Date()

  if (q < 4) {
    return { efactor: prevEfactor, lastStudied, interval: 1, repetition: 0 }
  }

  const efactorModifier = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  const efactor = Math.max(1.3, prevEfactor + efactorModifier)

  if (repetition === 0) {
    return { efactor, lastStudied, interval: 1, repetition: 1 }
  }

  if (repetition === 1) {
    return { efactor, lastStudied, interval: 6, repetition: 2 }
  }

  const interval = Math.round((prev.interval ?? INTERVAL) * prevEfactor)
  return { efactor, lastStudied, interval, repetition: repetition + 1 }
}

export default { init, filter, sort, update }
