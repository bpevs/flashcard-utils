import stringify from 'npm:json-stringify-pretty-compact'
import Deck from '../models/deck.ts'
import toOBJ from './to_obj.ts'

export default function toJSON(deck: Deck): string {
  return stringify(toOBJ(deck))
}
