import { assertEquals } from 'jsr:@std/assert'
import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import fromObj from '../from_obj.ts'
import fromTSV from '../from_tsv.ts'
import toTSV from '../to_tsv.ts'
import data from './__data__/zh_CN.ts'

/**
 * @todo Update TSV to support Anki-style TSV with headers
 * @reference https://docs.ankiweb.net/importing/text-files.html#file-headers
 */
Deno.test('init Deck to/from TSV', async (t) => {
  const deck = fromObj(data)
  const tsvResult = toTSV(deck)
  await assertSnapshot(t, tsvResult)
  const tsvDeck = fromTSV(tsvResult, {
    meta: {
      id: deck.id,
      name: deck.name,
      desc: deck.desc,
      key: deck.key,
      meta: deck.meta,
    },
  })

  assertEquals(deck.notes, tsvDeck.notes)
})
