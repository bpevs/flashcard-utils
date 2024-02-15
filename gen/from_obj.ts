import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'
import Note, { NoteData } from '../models/note.ts'
import sortByColumns from '../utils/sort_by_columns.ts'

export default function fromObj(obj: ExportObj): Deck {
  const { id: deckId, name, desc, columns, key, meta, notes } = obj
  const deck = new Deck({ id: deckId, name, key, desc, meta })

  deck.notes = notes.sort(sortByColumns).map((row) => {
    const data: NoteData = {}
    row.forEach((value, i) => {
      if (typeof columns[i] != 'string') {
        throw new Error(`Missing data, row: ${row}, column: ${i}`)
      } else data[columns[i]] = value
    })
    const noteId = `${deckId}_${data[key]}`
    return new Note({ id: noteId, data })
  })

  return deck
}
