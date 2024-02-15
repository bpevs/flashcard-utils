import type { Meta } from '../models/types.ts'
import Deck from '../models/deck.ts'
import fromObj from './from_obj.ts'

export default function fromTSV(
  tsv: string,
  options: {
    meta: {
      id: string
      name: string
      desc: string
      key: string
      meta?: Meta
    }
  },
): Deck {
  const [columnRow, ...noteRows] = tsv.split('\n')
  const columns = columnRow.split('\t')
  return fromObj({
    ...options.meta,
    columns,
    notes: noteRows
      .map((row) => row.split('\t'))
      .filter((row) => row.length === columns.length),
  })
}
