import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import fromJSON from '../from_json.ts'
import toJSON from '../to_json.ts'
import deckData from './__data__/zh_CN.ts'

Deno.test('init Deck to/from JSON', async (t) => {
  const deck = fromJSON(JSON.stringify(deckData))
  await assertSnapshot(t, toJSON(deck))
})
