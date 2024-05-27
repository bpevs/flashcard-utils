import Card from './card.ts'
import Template from './template.ts'

export type NoteContent = Record<string, string | number>

/**
 * A card contains the data necessary to create a flashcard.
 * Essentially, a "row" of the deck. A note contains one card per template
 */
export default class Note {
  id: string
  templates: Template[] = []
  content: NoteContent
  _cards: Card[] = []

  constructor(id: string, content: NoteContent, templates?: Template[]) {
    this.id = id
    this.content = content
    this._cards = []
    if (templates) this.templates = templates
  }

  getCards(templates: Record<string, Template> = {}): Card[] {
    const prevTemplatesLen = this.templates.length
    const newTemplatesLen = Object.keys(templates).length
    const cardsLength = this._cards.length
    if (newTemplatesLen && (newTemplatesLen !== prevTemplatesLen)) {
      this.templates = []
      Object.keys(templates).forEach((name) => {
        this.templates.push(templates[name])
      })
    }

    if (cardsLength !== this.templates.length) {
      this._cards = (this.templates || [])
        .map((template) => new Card(this.id + template.id, this, template))
    }

    return this._cards
  }
}
