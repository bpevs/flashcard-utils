/**
 * This is a Deno script, showing an example of instant language flashcards:
 *  1. Import a Deck from a TSV file
 *  2. Translate `English` field into Spanish and adding a `Spanish` field
 *  3. Run text-to-speech on the Spanish field, and add an `Audio` field
 *  4. Export the deck to an Anki `.apkg` file
 */
import { load } from 'jsr:@std/dotenv'
import { fromTsv } from 'jsr:@bpev/flashcards@1.0.0-beta.0/adapters/tsv'
import { toApkg } from 'jsr:@bpev/flashcards@1.0.0-beta.0/adapters/apkg'
import basic from 'jsr:@bpev/flashcards@1.0.0-beta.0/schedulers/basic'
import {
  generateTranslations,
  generateTTS,
} from 'jsr:@bpev/flashcards@1.0.0-beta.0/utils'

const env = await load()

const locale = 'es-MX'
const voiceId = 'es-MX-JorgeNeural'
const apiRegion = env['AZURE_REGION']
const translateApiKey = env['AZURE_TRANSLATE_KEY']
const ttsApiKey = env['AZURE_SPEECH_KEY']

const resp = Deno.readTextFileSync('./examples/words-to-apkg/data.tsv')
const deck = fromTsv(resp, basic)

await generateTranslations(deck, 'English', 'Spanish', {
  toLang: locale,
  apiKey: translateApiKey,
  apiRegion,
})

await generateTTS(deck, {
  apiKey: ttsApiKey,
  apiRegion,
  fromField: 'Spanish',
  locale,
  voiceId,
})

const media: Array<{ name: string; data: Blob }> = []

await Promise.all(
  Object.values(deck.cards).map(async (card) => {
    const audioFilename = `${card.id}.mp3`
    const audioLocation = `./audio/${card.id}.mp3`
    card.content.Audio = `[sound:${audioFilename}]`

    try {
      const fileBytes = await Deno.readFile(audioLocation)
      const data = new Blob([fileBytes], { type: 'audio/mpeg' })
      media.push({ name: audioFilename, data })
    } catch {
      console.warn('Missing audio file: ', audioFilename)
    }
  }),
)

await Deno.writeFile(
  `./spanish-or-vanish.apkg`,
  await toApkg(deck, {
    id: 1231241342,
    name: 'Frutas y Verduras',
    desc: 'A deck of English/Español fruits and veggies',
    fields: ['Emoji', 'English', 'Spanish', 'Audio'],
    sortField: 'emoji',
    media,
    templates: [
      {
        name: 'reading',
        qfmt: '{{Spanish}}',
        afmt: '{{Emoji}}{{Audio}}',
      },
      {
        name: 'speaking',
        qfmt: '{{Emoji}}',
        afmt: '{{Spanish}}{{Audio}}',
      },
      {
        name: 'speaking',
        qfmt: '{{Audio}}',
        afmt: '{{Emoji}}{{Spanish}}',
      },
    ],
  }),
)
