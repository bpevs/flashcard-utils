/**
 * Supermemo2 Algorithm
 * @reference https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * @reference https://super-memory.com/english/ol/sm2.htm
 */
import Card, { Scheduling } from '../models/card.ts'

const EF = 2.5
const REPETITION = 0
const INTERVAL = 0

export default { init, filter, sort, update }

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
  const due = getDueDate(card)
  return !due || (due <= new Date())
}

export function sort(cardA: Card, cardB: Card) {
  init(cardA)
  init(cardB)
  const aDue = getDueDate(cardA)
  const bDue = getDueDate(cardB)
  if (!aDue && bDue) return -1
  if (!bDue && aDue) return 1
  if (!aDue || !bDue) return (Math.random() - 0.5)
  if (sameDay(aDue, bDue)) return (Math.random() - 0.5)
  return (aDue.getDate() - bDue.getDate())
}

export function update(card: Card, quality: 0 | 1 | 2 | 3 | 4 | 5): Card {
  const {
    efactor: prevEfactor = EF,
    repetition: prevRepetition = REPETITION,
    interval: prevInterval = INTERVAL,
    lastStudied: prevLastStudied,
  } = card.scheduling
  const efactorModifier = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const efactor = Math.max(1.3, prevEfactor + efactorModifier)
  const lastStudied = new Date()

  if (quality < 4) {
    const studiedToday = sameDay(prevLastStudied || lastStudied, lastStudied)
    card.scheduling = {
      efactor: (quality < 3) ? prevEfactor : efactor,
      lastStudied,
      interval: studiedToday ? 0 : Math.min(1, prevInterval),
      repetition: 0,
    }
  } else if (prevRepetition === 0) {
    card.scheduling = { efactor, lastStudied, interval: 1, repetition: 1 }
  } else if (prevRepetition === 1) {
    card.scheduling = { efactor, lastStudied, interval: 6, repetition: 2 }
  } else {
    card.scheduling = {
      efactor,
      lastStudied,
      interval: Math.round(prevInterval * prevEfactor),
      repetition: prevRepetition + 1,
    }
  }

  return card
}

function getDueDate(card: Card): Date | null {
  if (!card.scheduling.lastStudied) return null
  const due = new Date(card.scheduling.lastStudied)
  due.setDate(due.getDate() + (card.scheduling.interval ?? INTERVAL))
  return due
}

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}
