import Deck from '../models/deck.ts'
import toObj from './to_obj.ts'

export default function toTSV(deck: Deck): string {
  const obj = toObj(deck)
  let tsv = obj.columns.join('\t') + '\n'

  obj.notes.forEach((row: string[]) => {
    tsv += row.map(format).join('\t') + '\n'
  })

  return tsv
}

function format(str: string): string {
  return str.replace(/\t/g, ' ').replace(/\n/g, ' <br/> ')
}
