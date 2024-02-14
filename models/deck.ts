import Note, { NoteData } from './note.ts'
import type { Meta } from './types.ts'

// A `Deck` represents a collection of notes.
export default class Deck {
  id: string
  idNum: number // For exports that use id number (Anki)
  name: string
  desc: string
  notes: Note[]
  meta?: { [key: string]: string | number }

  constructor({ id, name, desc, meta }: {
    id: string
    name: string
    desc: string
    meta?: Meta
  }) {
    this.id = id
    this.idNum = encode(name)
    this.name = name
    this.desc = desc
    this.notes = []
    if (meta) this.meta = meta
  }
}

function encode(str: string): number {
  let num: string = ""
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}
