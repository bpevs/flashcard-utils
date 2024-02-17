import Deck from '../models/deck.ts'
import fromOBJ from './from_obj.ts'

export default function fromJSON(
  str: string,
  options: { sortField?: string } = {},
): Deck {
  return fromOBJ(JSON.parse(str), options)
}
