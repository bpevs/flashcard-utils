import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import fromJSON from '../from_json.ts'
import toJSON from '../to_json.ts'
import data from './__data__/zh_CN.js'

Deno.test('init Deck to/from JSON', async (t) => {
  const deck = fromJSON(JSON.stringify(data))
  await assertSnapshot(t, toJSON(deck))
})
