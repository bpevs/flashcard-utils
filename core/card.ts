import type Scheduler from './scheduler.ts'

export default class Card<Content, ScheduleCache, Quality> {
  id: string
  content: Content
  scheduling: ScheduleCache

  constructor(id: string, content: Content, scheduling: ScheduleCache) {
    this.id = id
    this.content = content
    this.scheduling = scheduling
  }

  answer(
    scheduler: Scheduler<ScheduleCache, Quality>,
    quality: Quality,
  ): ScheduleCache {
    const { init, update } = scheduler
    this.scheduling = update(init(this.scheduling), quality)
    return this.scheduling
  }
}
