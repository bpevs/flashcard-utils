import { Deck, Note } from 'jsr:@flashcard/core@0.0.3'
import type { ExportObj } from './types.ts'

export default function toOBJ(deck: Deck): ExportObj {
  const notes = Object.values(deck.notes)
    .map((note: Note) =>
      deck.fields.map((field: string) => note.content[field])
    )

  const data: ExportObj = {
    id: deck.id,
    idNum: deck.idNum,
    name: deck.name,
    desc: deck.desc,
    meta: deck.meta,
    fields: deck.fields,
    watch: deck.watch,
    notes,
  }

  return data
}
