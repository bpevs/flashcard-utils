import Card from './card.ts'
import type Scheduler from './scheduler.ts'

export default class Deck<Content, ScheduleCache, Quality> {
  #cards: Record<string, Card<Content, ScheduleCache, Quality>> = {}
  scheduler: Scheduler<ScheduleCache, Quality>

  constructor(scheduler: Scheduler<ScheduleCache, Quality>) {
    this.scheduler = scheduler
  }

  addCard(
    id: string,
    content: Content,
    scheduleCache: Partial<ScheduleCache> = {},
  ): Card<Content, ScheduleCache, Quality> {
    const card = new Card<Content, ScheduleCache, Quality>(
      id,
      content,
      this.scheduler.init(scheduleCache),
    )
    this.#cards[card.id] = card
    return card
  }

  get cards(): Card<Content, ScheduleCache, Quality>[] {
    if (!this.scheduler) return []
    const { init, sort } = this.scheduler
    return Object.values(this.#cards)
      .toSorted((
        cardA: Card<Content, ScheduleCache, Quality>,
        cardB: Card<Content, ScheduleCache, Quality>,
      ) => sort(init(cardA.scheduling), init(cardB.scheduling)))
  }

  getNext(numCards = 0): Card<Content, ScheduleCache, Quality>[] {
    if (!this.scheduler) return []
    const { init, filter } = this.scheduler
    const cards = this.cards
      .filter((card: Card<Content, ScheduleCache, Quality>) =>
        filter(init(card.scheduling))
      )

    return (numCards > 0) ? cards.slice(0, numCards) : cards
  }
}
