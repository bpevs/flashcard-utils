import Deck from '../models/deck.ts'
import Note from '../models/note.ts'
import type { ExportObj } from './types.ts'

export default function toOBJ(deck: Deck): ExportObj {
  const fields = deck.content.fields

  const data: ExportObj = {
    id: deck.id,
    idNum: deck.idNum,
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
