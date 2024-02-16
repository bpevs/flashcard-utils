import type { Meta } from '../models/types.ts'
import Deck from '../models/deck.ts'
import fromObj from './from_obj.ts'

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
  return fromObj({
    ...options.meta,
    content: { fields },
    notes: noteRows
      .map((row) => row.split('\t'))
      .filter((row) => row.length === fields.length),
  }, { sortField: options.sortField })
}
