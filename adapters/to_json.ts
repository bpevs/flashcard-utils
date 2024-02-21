import { Deck } from '@flashcard/core'
import stringify from 'npm:json-stringify-pretty-compact@4.0.0'
import toOBJ from './to_obj.ts'

export default function toJSON(deck: Deck): string {
  return stringify(toOBJ(deck))
}
