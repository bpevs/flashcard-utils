import { assertEquals } from 'jsr:@std/assert'
import fromOBJ from '../from_obj.ts'
import toOBJ from '../to_obj.ts'
import deckData from './__data__/zh_CN.ts'

Deno.test('init Deck to/from obj', () => {
  const deck = fromOBJ(deckData, { sortField: 'emoji' })
  assertEquals(toOBJ(deck), deckData)
})

Deno.test('Should sort notes in order of column', () => {
  const data = {
    ...deckData,
    // Mess up order of notes
    notes: [
      ['color', '🟢', '绿', 'lǜ', '[sound:zh-cn_.mp3]'],
      ['animal', '🐶', '狗', 'gǒu', '[sound:zh-cn_狗.mp3]'],
      ['number', '8️⃣', '八', 'bā', '[sound:zh-cn_八.mp3]'],
      ['food', '🧊', '冰', 'bīng', '[sound:zh-cn_冰.mp3]'],
      ['body', '🦶', '脚', 'jiǎo', '[sound:zh-cn_脚.mp3]'],
      ['directions', '⬇️🍂', '下', 'xià', '[sound:zh-cn_下.mp3]'],
      ['number', '9️⃣', '九', 'jiǔ', '[sound:zh-cn_九.mp3]'],
      ['animal', '🐈', '猫', 'māo', '[sound:zh-cn_猫.mp3]'],
      ['number', '7️⃣', '七', 'qī', '[sound:zh-cn_七.mp3]'],
      ['transportation', '🚗', '汽车', 'qì chē', '[sound:zh-cn_汽车.mp3]'],
      ['verbs', '❤️😍', '爱', 'ài', '[sound:zh-cn_爱.mp3]'],
    ],
  }

  // Expect to equal original deckData
  const deck = fromOBJ(data, { sortField: 'emoji' })
  assertEquals(toOBJ(deck), deckData)
})
