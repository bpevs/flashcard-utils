import Template from '../../models/template.ts'
import { fromTSV, toAPKG as _toAPKG } from '../../adapters/mod.ts'
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
  new Template('Reading', '{{Chinese}}', '{{English}} ({{Pinyin}})'),
)
deck.addTemplate(
  new Template('Speaking', '{{English}}', '{{Chinese}} ({{Pinyin}})'),
)

generateAudio(deck, {
  locale: 'zh-TW',
  voiceId: 'zh-TW-YunJheNeural',
  apiRegion: '/REGION HERE',
  apiKey: '/API KEY HERE/',
  textField: 'Chinese',
})

// await Deno.writeFile('./HSK-1.apkg', await toAPKG(deck))
