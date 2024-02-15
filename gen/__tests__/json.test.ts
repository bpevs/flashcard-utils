import { assertSnapshot } from 'jsr:@std/testing/snapshot'
import fromJSON from '../from_json.ts'
import toJSON from '../to_json.ts'

Deno.test('init Deck to/from JSON', async (t) => {
  const deck = fromJSON(JSON.stringify({
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
    key: "emoji",
    columns: ['category_en', 'category', 'emoji', 'text', 'text_en', 'pinyin'],
    notes: [
      ['animal', '动物', '🐶', '狗', 'dog', 'gǒu'],
      ['body', '身体', '🦶', '脚', 'foot', 'jiǎo'],
      ['animal', '动物', '🐈', '猫', 'cat', 'māo'],
    ],
  }))
  await assertSnapshot(t, toJSON(deck))
})
