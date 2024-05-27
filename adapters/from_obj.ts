import { Deck, NoteContent } from 'jsr:@flashcard/core@0.0.3'
import type { ExportObj } from './types.ts'

export default function fromOBJ(
  obj: ExportObj,
  { sortField }: { sortField?: string } = {},
): Deck {
  const { id, idNum, name, desc, fields, watch, meta, notes } = obj
  const sortFieldIndex = sortField ? fields.indexOf(sortField) : -1

  const deck = new Deck(id, { idNum, desc, name, fields, watch, meta })

  notes.toSorted(sortByField).forEach(
    (row: Array<string | number>) => {
      const content: NoteContent = {}

      row.forEach((value, i) => {
        if (typeof fields[i] == 'string') content[fields[i]] = value
        else throw new Error(`Missing content, row: ${row}, column: ${i}`)
      })

      const id = sortFieldIndex != -1 ? row[sortFieldIndex] : row[0]
      if (deck.notes[id]) {
        throw new Error(`Duplicate id: ${id}. Consider setting sortField.`)
      }
      deck.addNote(String(id), content)
    },
  )

  return deck
}

// Sort by row values starting from index 0; aka put category first
function sortByField(
  a: Array<string | number>,
  b: Array<string | number>,
) {
  for (let i = 0; i < a.length; i++) {
    const comp = String(a[i]).localeCompare(String(b[i]))
    if (comp) return comp
  }
  return 0
}
