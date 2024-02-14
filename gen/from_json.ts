import Deck from '../models/deck.ts'
import fromObj from './from_obj.ts'

export default function fromJSON(str: string): Deck {
  return fromObj(JSON.parse(str))
}
