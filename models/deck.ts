import { intersect } from 'jsr:@std/collections/intersect'
import sm2 from '../schedulers/sm2.ts'
import Card from './card.ts'
import Note from './note.ts'
import type { Meta } from './types.ts'

interface Scheduler {
  init(card: Card): Card
  filter(card: Card): boolean
  sort(cardA: Card, cardB: Card): number
  update(card: Card, quality: number): Card
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
  scheduler: Scheduler
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
    this.scheduler = scheduler || sm2
    if (meta) this.meta = meta
  }

  get templates() {
    return Object.values(this.notes)[0].templates || []
  }

  get cards() {
    return Object.values(this.notes)
      .map((note) => note.cards)
      .flat().sort(this.scheduler.sort)
  }

  getCurrent() {
    return this.cards.filter(this.scheduler.filter)[0]
  }

  answerCurrent(quality: 0 | 1 | 2 | 3 | 4 | 5) {
    const currCard = this.getCurrent()
    currCard.answer(this, quality)
  }

  addNote(note: Note) {
    const noteFields = Object.keys(note.content)
    const commonFields = intersect(noteFields, this.content.fields)
    if (commonFields.length !== this.content.fields.length) {
      throw new Error(`mismatched number of fields, ${this.content.fields}`)
    }
    this.notes[note.id] = note
  }
}

function encode(str: string): number {
  let num = ''
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}
