import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'
import Note, { NoteData } from '../models/note.ts'

export default function fromObj(obj: ExportObj): Deck {
  const { id, name, desc, columns, meta, notes } = obj
  const deck = new Deck({ id, name, desc, meta })

  deck.notes = notes.map((row) => {
    const data: NoteData = {}
    row.forEach((value, i) => {
      if (typeof columns[i] != 'string') {
        throw new Error(`Missing data, row: ${row}, column: ${i}`)
      } else data[columns[i]] = value
    })
    return new Note({ data })
  })

  return deck
}
