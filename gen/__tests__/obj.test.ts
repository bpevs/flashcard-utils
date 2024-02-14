import { assertEquals } from 'jsr:@std/assert'
import fromObj from '../from_obj.ts'
import toObj from '../to_obj.ts'

const deckData = {
  id: 'zh-HK',
  name: '中文（普通话）',
  desc: 'Flashcards for Chinese',
  meta: {
    name_en: 'Chinese (Mandarin)',
    name_short: '中文',
    language_code: 'zh',
    locale_code: 'zh-CN',
    locale_code_azure: 'zh-CN',
    locale_code_deepl: 'zh',
    locale_flag: '🇨🇳',
    voice_id_azure: 'zh-CN-XiaoxiaoNeural',
  },
  columns: ['category_en', 'category', 'emoji', 'text', 'text_en', 'pinyin'],
  notes: [
    ['animal', '动物', '🐶', '狗', 'dog', 'gǒu'],
    ['animal', '动物', '🐈', '猫', 'cat', 'māo'],
    ['body', '身体', '🦶', '脚', 'foot', 'jiǎo'],
  ],
}

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
