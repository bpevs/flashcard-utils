import Card from './card.ts'
import Template, { TemplateType } from './template.ts'

export type NoteContent = Record<string, string | number>

/**
 * A card contains the data necessary to create a flashcard.
 * Essentially, a "row" of the deck. A note contains one card per template
 */
export default class Note {
  id: string
  templates: Record<string, Template> = {}
  content: NoteContent
  _cards: Map<Template, Card>

  constructor(id: string, content: NoteContent, templates?: Template[]) {
    this.id = id
    this.content = content
    this._cards = new Map()
    if (templates) templates.forEach((t) => this.templates[t.id] = t)
  }

  addTemplate(
    id: string,
    q: string,
    a: string,
    type?: TemplateType,
    style?: string,
  ): void {
    this.templates[id] = new Template(id, q, a, type, style)
    if (Object.keys(this.templates).length > this._cards.size) {
      Object.values(this.templates).forEach((template) => {
        if (!this._cards.get(template)) {
          const card = new Card(this.id + template.id, this, template)
          this._cards.set(template, card)
        }
      })
    }
  }

  getCards(templates?: Record<string, Template>): Card[] {
    return Array.from(this._cards, ([_template, card]) => card)
      .concat(
        Object.values(templates || {})
          .map((template) => new Card(this.id + template.id, this, template)),
      )
  }
}
