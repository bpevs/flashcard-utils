import Card from './card.ts'
import Template from './template.ts'

export interface Content {
  [key: string]: string
}

// Contains the data necessary to create a flashcard.
// Essentially, a "row" of the Deck.
// A note may contain multiple cards
export default class Note {
  id: string
  attachments: { [key: string]: string }
  _cards: Map<Template, Card>
  templates: Template[]
  content: Content

  constructor({ id, content, templates }: {
    id: string
    content: Content
    templates?: Template[]
  }) {
    this.id = id
    this.content = content
    this.attachments = {}
    this.templates = templates || []
    this._cards = new Map()
  }

  get cards(): Card[] {
    if (this.templates.length > this._cards.size) {
      this.templates.forEach((template) => {
        if (!this._cards.get(template)) {
          this._cards.set(
            template,
            new Card(this.id + template.id, this, template),
          )
        }
      })
    }
    return Array.from(this._cards, ([_template, card]) => card)
  }
}
