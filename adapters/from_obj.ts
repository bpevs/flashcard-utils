import { Deck, Note } from 'jsr:@flashcard/core@0.0.1'
import { Content } from 'jsr:@flashcard/core@0.0.1/note'
import type { ExportObj } from './types.ts'

export default function fromOBJ(
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

  notes.toSorted(sortByField).forEach((row: string[]) => {
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

// Sort by row values starting from index 0; aka put category first
function sortByField(a: string[], b: string[]) {
  for (let i = 0; i < a.length; i++) {
    const comp = a[i].localeCompare(b[i])
    if (comp) return comp
  }
  return 0
}
