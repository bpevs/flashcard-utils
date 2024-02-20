import { intersect } from 'jsr:@std/collections@0.216/intersect'
import Card from './card.ts'
import Note from './note.ts'
import Template from './template.ts'
import type { Meta, S } from './types.ts'

interface Scheduler {
  name: string
  init(s: S): S
  filter(s: S): boolean
  sort(sA: S, sB: S): number
  update(s: S, quality: number): S
}

interface ContentInfo {
  fields: string[] // Names of different content fields
  watch?: string[] // Names of fields that are watched for updates
}

// A `Deck` represents a collection of notes.
export default class Deck {
  id: string
  idNum: number // For exports that use id number (Anki)
  name: string
  desc: string
  notes: Record<string, Note>
  scheduler?: Scheduler
  content: ContentInfo
  meta?: Meta

  constructor(
    { id, idNum, name, desc, content, meta, scheduler, notes }: {
      id: string
      idNum?: number
      name: string
      desc: string
      meta?: Meta
      scheduler?: Scheduler
      content: ContentInfo
      notes: Record<string, Note>
    },
  ) {
    this.id = id
    this.idNum = idNum || encode(id)
    this.name = name
    this.desc = desc
    this.notes = notes || {}
    this.content = content
    this.scheduler = scheduler
    if (meta) this.meta = meta
  }

  get templates(): Template[] {
    return Object.values(this.notes)[0].templates || []
  }

  get cards(): Card[] {
    if (!this.scheduler) return []
    const { init, sort, name } = this.scheduler
    return Object.values(this.notes)
      .map((note) => note.cards)
      .flat()
      .toSorted((cardA: Card, cardB: Card) =>
        sort(
          init(cardA.scheduling[name]),
          init(cardB.scheduling[name]),
        )
      )
  }

  getCurrent(): Card | void {
    if (!this.scheduler) return
    const { init, filter, name } = this.scheduler
    return this.cards.filter((card: Card) => {
      return filter(init(card.scheduling[name]))
    })[0]
  }

  answerCurrent(quality: 0 | 1 | 2 | 3 | 4 | 5): void {
    const currCard = this.getCurrent()
    if (currCard) currCard.answer(this, quality)
  }

  addNote(note: Note): void {
    const noteFields = Object.keys(note.content)
    const commonFields = intersect(noteFields, this.content.fields)
    if (commonFields.length !== this.content.fields.length) {
      throw new Error(`mismatched number of fields, ${this.content.fields}`)
    }
    this.notes[note.id] = note
  }

  addTemplate(template: Template): void {
    Object.values(this.notes)
      .forEach((note) => note.templates.push(template))
  }
}

function encode(str: string): number {
  let num = ''
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}
