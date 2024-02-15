import Note from './note.ts'
import Template from './template.ts'

interface Scheduling {
  interval?: number
  repetition?: number
  efactor?: number
}

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
    template: Template,
    scheduling: Scheduling = {},
  ) {
    this.id = id
    this.note = note
    this.template = template
    this.scheduling = scheduling
  }
}
