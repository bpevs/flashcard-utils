import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'

export default function toObj(deck: Deck): ExportObj {
  const data: ExportObj = {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    meta: deck.meta,
    columns: [],
    notes: [],
  }
  if (!deck.meta) delete deck.meta
  data.columns = Object.keys(deck.notes[0].data)

  data.notes = deck.notes.map((note) => {
    if (Object.keys(note.data).length !== data.columns.length) {
      console.log(note)
      throw new Error(`Mismatched column length, row: ${note.id}`)
    }
    return data.columns.map((key) => note.data[key])
  })

  // Sort by row values starting from index 0; aka put category first
  data.notes.sort((a, b) => {
    for (let i = 0; i < a.length; i++) {
      const comp = (a[i]).localeCompare(b[0])
      if (comp) return comp
    }
    return 0
  })

  return data
}
