import Template from '../../models/template.ts'
import fromJSON from '../from_json.ts'
import toAPKG from '../to_apkg.ts'
import deckData from './__data__/zh_CN.ts'

const templateA = new Template(
  'reading',
  '<h1>{{emoji}}</h1>',
  '{{FrontSide}}\n{{text}}',
)

const templateB = new Template(
  'speaking',
  '<h1>{{Text}}</h1>',
  '{{FrontSide}}\n{{emoji}}',
)

Deno.test('write deck to APKG', async () => {
  const deck = fromJSON(JSON.stringify(deckData))

  deck.notes.forEach((note) => {
    note.templates.push(templateA)
    note.templates.push(templateB)
  })

  await Deno.writeFile('./my-deck.apkg', await toAPKG(deck))
})
