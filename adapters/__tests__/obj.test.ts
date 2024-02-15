import { assertEquals } from 'jsr:@std/assert'
import fromObj from '../from_obj.ts'
import toObj from '../to_obj.ts'
import deckData from './__data__/zh_CN.ts'

Deno.test('init Deck to/from obj', () => {
  assertEquals(toObj(fromObj(deckData)), deckData)
})

Deno.test('Should sort notes in order of column', () => {
  const data = {
    ...deckData,
    // Mess up order of notes
    notes: [
      ['animal', '🐈', '猫', 'māo'],
      ['color', '🟢', '绿', 'lǜ'],
      ['animal', '🐶', '狗', 'gǒu'],
      ['number', '8️⃣', '八', 'bā'],
      ['body', '🦶', '脚', 'jiǎo'],
      ['directions', '⬇️🍂', '下', 'xià'],
      ['food', '🧊', '冰', 'bīng'],
      ['number', '7️⃣', '七', 'qī'],
      ['transportation', '🚗', '汽车', 'qì chē'],
      ['number', '9️⃣', '九', 'jiǔ'],
      ['verbs', '❤️😍', '爱', 'ài'],
    ],
  }

  // Expect to equal original deckData
  assertEquals(toObj(fromObj(data)), deckData)
})
