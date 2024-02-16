import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'
import Note, { Content } from '../models/note.ts'
import sortByColumns from '../utils/sort_by_columns.ts'

export default function fromObj(
  obj: ExportObj,
  { sortField }: { sortField?: string } = {},
): Deck {
  const { id, idNum, name, desc, content, meta, notes } = obj
  const { fields, watch } = content
  const sortFieldIndex = sortField ? fields.indexOf(sortField) : -1

  const deck = new Deck({
    id,
    idNum,
    desc,
    name,
    content: { fields, watch },
    meta,
    notes: {},
  })

  notes.toSorted(sortByColumns).forEach((row: string[]) => {
    const content: Content = {}

    row.forEach((value, i) => {
      if (typeof fields[i] == 'string') content[fields[i]] = value
      else throw new Error(`Missing content, row: ${row}, column: ${i}`)
    })

    const id = sortFieldIndex != -1 ? row[sortFieldIndex] : row[0]
    if (deck.notes[id]) {
      throw new Error(`Duplicate id: ${id}. Consider setting sortField.`)
    }
    deck.addNote(new Note({ id, content }))
  })

  return deck
}
