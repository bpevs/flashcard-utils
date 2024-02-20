import Template from '../../models/template.ts'
import { fromTSV, toAPKG as toAPKG } from '../../adapters/mod.ts'
import generateAudio from '../../utils/generate_audio.ts'

const url =
  'https://raw.githubusercontent.com/bpevs/flashcard_data/main/hsk3.0-band-1.tsv'

const resp = await fetch(url).then((resp) => resp.text())
const deck = fromTSV(resp, {
  sortField: 'No',
  meta: {
    id: 'hsk-1',
    name: 'HSK Band 1',
    desc: 'Chinese flashcards for the HSK test',
  },
})

deck.addTemplate(
  new Template(
    'Reading',
    '{{Chinese}}',
    '{{English}} ({{Pinyin}})<br/> {{Audio}}',
  ),
)
deck.addTemplate(
  new Template(
    'Speaking',
    '{{English}}',
    '{{Chinese}} ({{Pinyin}})<br/> {{Audio}}',
  ),
)
deck.addTemplate(
  new Template(
    'Listening',
    '{{Audio}}',
    '{{Chinese}} ({{Pinyin}})<br/> {{English}}',
  ),
)

generateAudio(deck, {
  locale: 'zh-TW',
  voiceId: 'zh-TW-YunJheNeural',
  apiRegion: '/REGION HERE',
  apiKey: '/API KEY HERE/',
  textField: 'Chinese',
})

const media: Array<{ name: string; data: Blob }> = []
deck.content.fields.push('Audio')

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

await Deno.writeFile('./HSK-1.apkg', await toAPKG(deck, { media }))
