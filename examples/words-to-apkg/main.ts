/**
 * This is a Deno script, showing an example of instant language flashcards:
 *  1. Import a Deck from a TSV file
 *  2. Translate `English` field into Spanish and adding a `Spanish` field
 *  3. Run text-to-speech on the Spanish field, and add an `Audio` field
 *  4. Export the deck to an Anki `.apkg` file
 */
import { fromTSV, toAPKG as toAPKG } from '@flashcard/adapters'
import { generateTranslations, generateTTS } from '@flashcard/utils'

const locale = 'es-MX'
const voiceId = 'es-MX-JorgeNeural'
const apiRegion = '/* AZURE REGION GOES HERE*/'
const translateApiKey = '/* AZURE API KEY GOES HERE*/'
const ttsApiKey = '/* AZURE API KEY GOES HERE*/'

const resp = Deno.readTextFileSync('./examples/words-to-apkg/data.tsv')
const deck = fromTSV(resp, {
  sortField: 'Emoji',
  meta: {
    id: 'fruits-veggies-español',
    name: 'Frutas y Verduras',
    desc: 'A deck of English/Español fruits and veggies',
  },
})

deck.addTemplate('Reading', '{{Spanish}}', '{{Emoji}}{{Audio}}')
deck.addTemplate('Speaking', '{{Emoji}}', '{{Spanish}}{{Audio}}')
deck.addTemplate('Listening', '{{Audio}}', '{{Emoji}}{{Spanish}}')

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
deck.fields.push('Audio')

await Promise.all(
  Object.values(deck.notes).map(async (note) => {
    const audioFilename = `${note.id}.mp3`
    const audioLocation = `./audio/${note.id}.mp3`
    note.content.Audio = `[sound:${audioFilename}]`

    try {
      const fileBytes = await Deno.readFile(audioLocation)
      const data = new Blob([fileBytes], { type: 'audio/mpeg' })
      media.push({ name: audioFilename, data })
    } catch {
      console.warn('Missing audio file: ', audioFilename)
    }
  }),
)

await Deno.writeFile(`./${deck.id}.apkg`, await toAPKG(deck, { media }))
