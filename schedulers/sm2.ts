/**
 * Supermemo2 Algorithm
 * @reference https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * @reference https://super-memory.com/english/ol/sm2.htm
 */
import { Scheduler } from '@flashcard/core'

type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface ScheduleCache {
  interval: number
  repetition: number
  efactor: number
  lastStudied?: Date
}

const EF = 2.5
const REPETITION = 0
const INTERVAL = 0

const sm2Scheduler: Scheduler<ScheduleCache, Quality> = new Scheduler<
  ScheduleCache,
  Quality
>({
  name: 'sm2',

  /**
   * 1. Ensures repetition and interval start at 0.
   * 2. Ensures that EF starts at 2.5
   */
  init(
    { efactor = EF, repetition = REPETITION, interval = INTERVAL }:
      ScheduleCache = {
        efactor: EF,
        repetition: REPETITION,
        interval: INTERVAL,
      },
  ) {
    return { efactor, repetition, interval }
  },

  /**
   * Only show cards that have a due date today, or in the past
   * After each repetition session of a given day repeat again all items that scored below four
   */
  filter(scheduleCache: ScheduleCache) {
    const due = getDueDate(scheduleCache)
    return !due || (due <= new Date())
  },

  /**
   * Sort by lastStudied. If they are the same day, sort randomly
   */
  sort(sA: ScheduleCache, sB: ScheduleCache) {
    const aDue = getDueDate(sA)
    const bDue = getDueDate(sB)
    if (!aDue && bDue) return -1
    if (!bDue && aDue) return 1
    if (!aDue || !bDue) return (Math.random() - 0.5)
    if (sameDay(aDue, bDue)) return (Math.random() - 0.5)
    return (aDue.getTime() - bDue.getTime())
  },

  /**
   * Interval(1):=1
   * Interval(2):=6
   * for n>2: Interval(n):=Interval(n-1)*EF
   *
   * EF’:=EF+(0.1-(5-quality)*(0.08+(5-quality)*0.02))
   *
   * If the quality response was lower than 3 then start repetitions for the
   * item from the beginning without changing the E-Factor
   */
  update({
    efactor: prevEfactor,
    repetition: prevRepetition,
    interval: prevInterval,
    lastStudied: prevLastStudied,
  }: ScheduleCache, quality: Quality) {
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
  },
})

export default sm2Scheduler

function getDueDate(scheduleCache: ScheduleCache): Date | null {
  if (!scheduleCache.lastStudied) return null
  const due = new Date(scheduleCache.lastStudied)
  due.setDate(due.getDate() + (scheduleCache.interval ?? INTERVAL))
  return due
}

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}
