import { Template } from 'jsr:@flashcard/core@0.0.1'
import fromJSON from '../from_json.ts'
import toAPKG from '../to_apkg.ts'
import deckData from './__data__/zh_CN.ts'

const templateA = new Template(
  'reading',
  '<h1>{{emoji}}</h1>',
  '{{FrontSide}}\n{{text}}{{sound}}',
)

const templateB = new Template(
  'speaking',
  '<h1>{{Text}}</h1>',
  '{{FrontSide}}\n{{emoji}}{{sound}}',
)

Deno.test('write deck to APKG', async () => {
  const deck = fromJSON(JSON.stringify(deckData), { sortField: 'emoji' })

  Object.values(deck.notes).forEach((note) => {
    note.templates.push(templateA)
    note.templates.push(templateB)
  })

  const media = []
  const path = './adapters/__tests__/__data__/audio'
  for await (
    const file of Deno.readDir(path)
  ) {
    const bytes = await Deno.readFile(path + '/' + file.name)
    const blob = new Blob([bytes], { type: 'audio/mpeg' })
    media.push({ name: file.name, data: blob })
  }

  await Deno.writeFile(
    './test.apkg',
    await toAPKG(deck, { sortField: 'emoji', media }),
  )
})
