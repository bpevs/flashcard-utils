type Params = Record<PropertyKey, string | number | boolean>

export default class Scheduler<ScheduleCache, Quality> {
  params: Params = {}

  constructor({ init, filter, params, sort, update }: {
    init?: (s: ScheduleCache) => ScheduleCache
    filter?: (_s: ScheduleCache) => boolean
    params?: Params
    sort?: (_sA: ScheduleCache, _sB: ScheduleCache) => number
    update?: (s: ScheduleCache, quality: Quality) => ScheduleCache
  }) {
    if (init) this.init = init
    if (filter) this.filter = filter
    if (params) this.params = params
    if (sort) this.sort = sort
    if (update) this.update = update
  }

  /**
   * Applies default properties to a cache , to ensure that all the other
   * methods work.
   */
  init(_s: Partial<ScheduleCache>): ScheduleCache {
    throw new Error('init is not implemented')
  }

  /**
   * To be used as a predicate to filter an array of ScheduleCache objs.
   * Helps determine what cards will be shown in a given timeframe.
   */
  filter(_s: ScheduleCache): boolean {
    return true
  }

  /**
   * To be used as a predicate for `.sort` and `.toSorted` methods.
   * Helps determine card priority
   */
  sort(_sA: ScheduleCache, _sB: ScheduleCache): number {
    return 0
  }

  /**
   * This is the scheduler's grading algorithm, and is expected to update the
   * ScheduleCache with updated stats
   */
  update(s: ScheduleCache, _quality: Quality): ScheduleCache {
    return s
  }
}
