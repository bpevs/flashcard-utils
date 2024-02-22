import { Deck } from 'jsr:@flashcard/core@0.0.2'
import stringify from 'npm:json-stringify-pretty-compact@4.0.0'
import toOBJ from './to_obj.ts'

export default function toJSON(deck: Deck): string {
  return stringify(toOBJ(deck))
}
