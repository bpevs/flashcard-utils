import { assertEquals } from 'jsr:@std/assert'
import fromObj from '../from_obj.ts'
import toObj from '../to_obj.ts'
import deckData from './__data__/zh_CN.js'

Deno.test('init Deck to/from obj', () => {
  assertEquals(toObj(fromObj(deckData)), deckData)
})

Deno.test('Should sort notes in order of column', () => {
  const data = {
    ...deckData,
    // Mess up order of notes
    notes: [
      ['animal', '动物', '🐶', '狗', 'dog', 'gǒu'],
      ['body', '身体', '🦶', '脚', 'foot', 'jiǎo'],
      ['animal', '动物', '🐈', '猫', 'cat', 'māo'],
    ],
  }
  // Expect to equal original deckData
  assertEquals(toObj(fromObj(data)), deckData)
})
