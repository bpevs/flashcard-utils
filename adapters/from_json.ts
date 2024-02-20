import { Deck } from 'jsr:@flashcard/core@0.0.1'
import fromOBJ from './from_obj.ts'

export default function fromJSON(
  str: string,
  options: { sortField?: string } = {},
): Deck {
  return fromOBJ(JSON.parse(str), options)
}
