import Card, { Scheduling } from './card.ts'
import Note from './note.ts'
import type { Meta } from './types.ts'
import sm2 from '../schedulers/sm2.ts'

interface Scheduler {
  init(card: Card): Card
  filter(card: Card): boolean
  sort(cardA: Card, cardB: Card): number
  update(scheduling: Scheduling, quality: number): Scheduling
}

// A `Deck` represents a collection of notes.
export default class Deck {
  id: string
  idNum: number // For exports that use id number (Anki)
  name: string
  desc: string
  key: string // Unique key of each Note. Used to create Note id
  notes: Note[]
  scheduler: Scheduler
  meta?: { [key: string]: string | number }

  constructor({ id, name, desc, key, meta, scheduler }: {
    id: string
    name: string
    desc: string
    key: string
    meta?: Meta
    scheduler?: Scheduler
  }) {
    this.id = id
    this.idNum = encode(name)
    this.name = name
    this.desc = desc
    this.notes = []
    this.key = key
    this.scheduler = scheduler || sm2
    if (meta) this.meta = meta
  }

  get templates() {
    return this.notes[0].templates || []
  }

  get cards() {
    return this.notes.map((note) => note.cards).flat().sort(this.scheduler.sort)
  }

  getCurrent() {
    return this.cards.filter(this.scheduler.filter)[0]
  }

  answerCurrent(quality: 0 | 1 | 2 | 3 | 4 | 5) {
    const currCard = this.getCurrent()
    currCard.answer(this, quality)
  }
}

function encode(str: string): number {
  let num = ''
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}
