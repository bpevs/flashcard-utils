import type { ExportObj } from '../models/types.ts'
import Deck from '../models/deck.ts'
import Note from '../models/note.ts'

export default function toObj(deck: Deck): ExportObj {
  const fields = deck.content.fields

  const data: ExportObj = {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    meta: deck.meta,
    content: { fields, watch: deck.content.watch },
    notes: Object.values(deck.notes).map(
      (note: Note) => fields.map((field: string) => note.content[field]),
    ),
  }

  if (!deck.meta) delete deck.meta

  return data
}
