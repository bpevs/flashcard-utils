import { Deck, Meta } from '@flashcard/core'
import fromOBJ from './from_obj.ts'

export default function fromTSV(
  tsv: string,
  options: {
    sortField?: string
    meta: {
      id: string
      name: string
      desc: string
      meta?: Meta
    }
  },
): Deck {
  const [fieldRow, ...noteRows] = tsv.split('\n')
  const fields = fieldRow.split('\t')
  return fromOBJ({
    ...options.meta,
    content: { fields },
    notes: noteRows
      .map((row) => row.split('\t'))
      .filter((row) => row.length === fields.length),
  }, { sortField: options.sortField })
}
