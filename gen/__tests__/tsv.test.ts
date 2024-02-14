import { assertEquals } from 'jsr:@std/assert'
import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import fromObj from '../from_obj.ts'
import fromTSV from '../from_tsv.ts'
import toTSV from '../to_tsv.ts'

Deno.test('init Deck to/from JSON', async (t) => {
  const deck = fromObj({
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
      ['body', '身体', '🦶', '脚', 'foot', 'jiǎo'],
      ['animal', '动物', '🐈', '猫', 'cat', 'māo'],
    ],
  })
  const tsvResult = toTSV(deck)
  await assertSnapshot(t, tsvResult)
  const tsvDeck = fromTSV(tsvResult, {
    id: deck.id,
    name: deck.name,
    desc: deck.desc,
    meta: deck.meta,
  })

  assertEquals(deck.notes, tsvDeck.notes)
})
