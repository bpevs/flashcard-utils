import Note from './note.ts'
import type { Meta } from './types.ts'

// A `Deck` represents a collection of notes.
export default class Deck {
  id: string
  idNum: number // For exports that use id number (Anki)
  name: string
  desc: string
  key: string // Unique key of each Note. Used to create Note id
  notes: Note[]
  meta?: { [key: string]: string | number }

  constructor({ id, name, desc, key, meta }: {
    id: string
    name: string
    desc: string
    key: string
    meta?: Meta
  }) {
    this.id = id
    this.idNum = encode(name)
    this.name = name
    this.desc = desc
    this.notes = []
    this.key = key
    if (meta) this.meta = meta
  }
}

function encode(str: string): number {
  let num = ''
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}
