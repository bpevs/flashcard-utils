import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'
import Note, { Content } from '../models/note.ts'
import sortByColumns from '../utils/sort_by_columns.ts'

export default function fromObj(obj: ExportObj): Deck {
  const { id: deckId, name, desc, columns, key, meta, notes } = obj
  const deck = new Deck({ id: deckId, name, key, desc, meta })

  deck.notes = notes.sort(sortByColumns).map((row) => {
    const content: Content = {}
    row.forEach((value, i) => {
      if (typeof columns[i] != 'string') {
        throw new Error(`Missing content, row: ${row}, column: ${i}`)
      } else content[columns[i]] = value
    })
    const noteId = `${deckId}_${content[key]}`
    return new Note({ id: noteId, content })
  })

  return deck
}
