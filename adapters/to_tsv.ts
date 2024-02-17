import Deck from '../models/deck.ts'
import toOBJ from './to_obj.ts'

export default function toTSV(deck: Deck): string {
  const obj = toOBJ(deck)
  let tsv = obj.content.fields.join('\t') + '\n'

  obj.notes.forEach((row: string[]) => {
    tsv += row.map(format).join('\t') + '\n'
  })

  return tsv
}

function format(str: string): string {
  return str.replace(/\t/g, ' ').replace(/\n/g, ' <br/> ')
}
