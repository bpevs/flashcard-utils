import Deck from './deck.ts'
import Note from './note.ts'
import Template from './template.ts'
import type { S } from './types.ts'

export interface Scheduling {
  [key: string]: S
}

const basicTemplate = new Template(
  'basic',
  '{{question}}',
  '{{answer}}',
)

// A visual representation of a Note. A card contains no actual data.
// Instead, it contains:
//   1. A template, showing how to display a Note's data
//   2. Scheduling information, used by various algorithms
export default class Card {
  id: string
  template: Template
  note: Note
  scheduling: Scheduling

  constructor(
    id: string,
    note: Note,
    template: Template = basicTemplate,
    scheduling: Scheduling = {},
  ) {
    this.id = id
    this.note = note
    this.template = template
    this.scheduling = scheduling
  }

  renderQuestion(): string {
    return this.template.renderQuestion(this.note.content)
  }

  renderAnswer(): string {
    return this.template.renderAnswer(this.note.content)
  }

  answer(deck: Deck, quality: 0 | 1 | 2 | 3 | 4 | 5): Scheduling | void {
    if (!deck.scheduler) return
    const { name, init, update } = deck.scheduler
    this.scheduling[name] = update(init(this.scheduling[name]), quality)
    return this.scheduling[name]
  }
}
