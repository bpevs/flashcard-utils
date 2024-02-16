/**
 * To a Uint8Array that can be written to a .apkg file
 */
import Deck from '../models/deck.ts'
import Template from '../models/template.ts'
import toObj from './to_obj.ts'
import {
  ankiHash,
  Deck as AnkiDeck,
  Model as AnkiModel,
  Package as AnkiPackage,
} from './to_apkg/mod.ts'

type AnkiReq = Array<[
  number, // Template Index
  'any' | 'all', // Are ALL fields required, or just any?
  number[], // Required Fields, by ord
]>

export default function toAPKG(deck: Deck): Promise<Uint8Array> {
  const obj = toObj(deck)
  const templates = deck.notes[0].templates.map((template: Template) => ({
    name: template.id,
    qfmt: template.question,
    afmt: template.answer,
  }))
  const mainFieldIndex = obj.columns.indexOf(deck.key)
  const fieldNames = obj.columns.map((name) => ({ name }))
  fieldNames.unshift(fieldNames.splice(mainFieldIndex, 1)[0])

  const ankiModel = new AnkiModel({
    name: deck.name,
    id: deck.idNum,
    did: deck.idNum,
    flds: fieldNames,
    req: templates.map((_, index) => [index, 'all', [0]]),
    tmpls: templates,
  })

  const ankiDeck = new AnkiDeck(deck.idNum, deck.name)
  const pkg = new AnkiPackage()

  for (const note of deck.notes) {
    const fields = fieldNames.map(({ name }) => note.content[name])
    const guid = ankiHash(Object.values(note.content))
    ankiDeck.addNote(ankiModel.createNote(fields, [/* tags */], guid))
  }

  pkg.addDeck(ankiDeck)
  return pkg.writeToArray()
}
