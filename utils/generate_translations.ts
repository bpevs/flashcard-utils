import { Deck, Note } from 'jsr:@flashcard/core@0.0.3'

export enum API {
  DEEPL = 0,
  AZURE,
}
const DEEPL_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate'
const AZURE_API_ENDPOINT =
  'https://api.cognitive.microsofttranslator.com/translate'

export interface Options {
  fromLang?: string
  toLang: string
  api?: API
  apiKey: string
  apiRegion?: string
}

export default async function generateTranslations(
  deck: Deck,
  fromField: string,
  toField: string,
  options: Options,
): Promise<Deck> {
  const notes = Object.values(deck.notes)
  const texts = notes.map((note: Note) => String(note.content[fromField]))
  const translated = await translateTexts(
    texts,
    options.fromLang || 'en',
    options.toLang || 'en',
    options.api ?? API.AZURE,
    options.apiKey,
    options.apiRegion,
  )
  notes.forEach((note: Note, index) =>
    note.content[toField] = translated[index]
  )
  deck.fields = deck.fields
    .filter((field: string) => field !== toField)
    .concat([toField])
  return deck
}

export const translateTexts = (
  texts: string[],
  fromLang: string,
  toLang: string,
  api: API,
  apiKey: string,
  apiRegion = 'westus',
): Promise<string[]> => {
  if (api === API.AZURE) {
    return translateAzure(texts, toLang, fromLang, apiKey, apiRegion)
  }
  if (api === API.DEEPL) return translateDeepl(texts, toLang, apiKey)
  else throw new Error(`Does not support the transation api ${api}`)
}

async function translateAzure(
  texts: string[],
  to: string,
  from: string,
  apiKey: string,
  apiRegion: string,
): Promise<string[]> {
  const url = new URL(AZURE_API_ENDPOINT)
  url.search = new URLSearchParams({ 'api-version': '3.0', from, to })
    .toString()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': apiRegion,
      'Content-type': 'application/json',
      'X-ClientTraceId': crypto.randomUUID(),
    },
    body: JSON.stringify(texts.map((text) => ({ text }))),
  })
  type Resp = { translations: Array<{ text: 'string'; to: 'string' }> }
  return (await response.json()).map((resp: Resp) => resp.translations[0].text)
}

async function translateDeepl(
  texts: string[],
  to: string,
  apiKey: string,
): Promise<string[]> {
  const text = encodeURIComponent(texts.join('\n'))

  const response = await fetch(DEEPL_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `auth_key=${apiKey}&text=${text}&target_lang=${to}`,
  })

  return (await response.json()).translations[0].text.split('\n')
}
