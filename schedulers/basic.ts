import { Scheduler } from '@flashcard/core'

export interface ScheduleCache {
  repetition: number
}

type Quality = 0 | 1

/**
 * A basic scheduler to demonstrate usage
 */
const basicScheduler: Scheduler<ScheduleCache, Quality> = new Scheduler<
  ScheduleCache,
  Quality
>({
  name: 'basic-scheduler',

  // Ensure that repetition is an int
  init(s: ScheduleCache = { repetition: 0 }) {
    return { repetition: s.repetition || 0 }
  },

  // If answered correctly 3 times, skip it!
  filter({ repetition = 0 }: ScheduleCache) {
    return repetition < 3
  },

  // Sort by least-repeated. If they are the same, then sort randomly!
  sort(sA: ScheduleCache, sB: ScheduleCache): number {
    return (sA.repetition - sB.repetition) || (Math.random() - 0.5)
  },

  // If answered correctly, increment the repetition
  update({ repetition }: ScheduleCache, quality: Quality) {
    return { repetition: quality ? repetition + 1 : repetition }
  },
})

export default basicScheduler
