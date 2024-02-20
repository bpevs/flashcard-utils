import Template from 'https://deno.land/x/flashcards@0.0.1/models/template.ts'
import {
  fromTSV,
  toAPKG,
} from 'https://deno.land/x/flashcards@0.0.1/adapters/mod.ts'

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

await Deno.writeFile('./HSK-1.apkg', await toAPKG(deck))
