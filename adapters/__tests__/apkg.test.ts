import { toApkg } from '../apkg.ts'
import { cardData } from './__data__/zh_CN.ts'
import Deck from '../../core/deck.ts'
import basic from '../../schedulers/basic.ts'

Deno.test('write deck to APKG', async () => {
  // deno-lint-ignore no-explicit-any
  const deck = new Deck<any, any, any>(basic)
  cardData.forEach(([category, emoji, text, pinyin, sound]) => {
    deck.addCard(emoji, { category, emoji, text, pinyin, sound })
  })

  const media = []
  const path = './adapters/__tests__/__data__/audio'
  for await (const file of Deno.readDir(path)) {
    const bytes = await Deno.readFile(path + '/' + file.name)
    const blob = new Blob([bytes], { type: 'audio/mpeg' })
    media.push({ name: file.name, data: blob })
  }

  await Deno.writeFile(
    './test.apkg',
    await toApkg(deck, {
      id: 1231241342,
      name: 'name',
      desc: 'desc',
      fields: ['category', 'emoji', 'text', 'pinyin', 'sound'],
      sortField: 'emoji',
      media,
      templates: [
        {
          name: 'reading',
          qfmt: '<h1>{{emoji}}</h1>',
          afmt: '{{FrontSide}}\n{{text}}{{sound}}',
        },
        {
          name: 'speaking',
          qfmt: '<h1>{{text}}</h1>',
          afmt: '{{FrontSide}}\n{{emoji}}{{sound}}',
        },
      ],
    }),
  )
})
