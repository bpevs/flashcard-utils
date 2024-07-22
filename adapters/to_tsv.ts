import type { Deck } from '@flashcard/core'
import toOBJ from './to_obj.ts'

export default function toTSV(deck: Deck): string {
  const obj = toOBJ(deck)
  let tsv = obj.fields.join('\t') + '\n'

  obj.notes.forEach((row: Array<string | number>) => {
    tsv += row.map(format).join('\t') + '\n'
  })

  return tsv
}

function format(str: string | number): string {
  return String(str).replace(/\t/g, ' ').replace(/\n/g, ' <br/> ')
}
