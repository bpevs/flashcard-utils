import { Deck, type Scheduler } from '../core/mod.ts'

type Row =
  | Array<number | string>
  | Record<PropertyKey, number | string>

export function fromArray<Content, ScheduleCache, Quality>(
  rows: Array<Row>,
  scheduler: Scheduler<ScheduleCache, Quality>,
  options: {
    fields?: string[]
  },
  // deno-lint-ignore no-explicit-any
): Deck<any, any, any> {
  const deck = new Deck<Content, ScheduleCache, Quality>(scheduler)
  const fields: string[] = options.fields || Object.keys(rows[0])

  rows.forEach((row) => {
    const properties: { [field: string]: number | string } = {}
    if (Array.isArray(row)) {
      fields.forEach((fieldName, index) => properties[fieldName] = row[index])
    } else {
      fields.forEach((fieldName) => properties[fieldName] = row[fieldName])
    }
    // deno-lint-ignore no-explicit-any
    deck.addCard(String(properties[fields[0]]), properties as any)
  })

  return deck
}

export function toArray(
  // deno-lint-ignore no-explicit-any
  deck: Deck<any, any, any>,
  options: {
    flatten: boolean
    fields?: string[]
  },
): Row[] {
  const rows: Array<Row> = []
  const cards = deck.cards
  const fields: string[] = Object.freeze(options.fields || cards[0].content)

  cards.forEach((card) => {
    if (options.flatten) {
      return fields.map((field) => card.content[field])
    } else {
      const row: Record<PropertyKey, number | string> = {}
      fields.forEach((field) => row[field] = card.content[field])
      return row
    }
  })

  return rows
}
