import Deck from './deck.ts'
import Note from './note.ts'
import Template from './template.ts'

export interface Scheduling {
  // deno-lint-ignore no-explicit-any
  [key: string]: Record<PropertyKey, any>
}

/**
 *  A visual representation of a Note. A card contains no actual data.
 *  Instead, it contains:
 *   1. A template, showing how to display a Note's data
 *   2. Scheduling information, used by various algorithms
 */
export default class Card {
  id: string
  template: Template
  note: Note
  scheduling: Scheduling

  constructor(
    id: string,
    note: Note,
    template: Template = new Template('basic', '{{question}}', '{{answer}}'),
    scheduling: Scheduling = {},
  ) {
    this.id = id
    this.note = note
    this.template = template
    this.scheduling = scheduling
  }

  get content() {
    return this.note.content
  }

  answer(deck: Deck, quality: number): Scheduling | void {
    if (!deck.scheduler) return
    const { name, init, update } = deck.scheduler
    this.scheduling[name] = update(init(this.scheduling[name]), quality)
    return this.scheduling[name]
  }

  render(): { question: string; answer: string } {
    return this.template.render(this.note.content)
  }
}
