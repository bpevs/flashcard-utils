import type { Deck, Scheduler } from '../core/mod.ts'
import { fromArray, toArray } from './array.ts'

export function fromTsv<Content, ScheduleCache, Quality>(
  tsv: string,
  scheduler: Scheduler<ScheduleCache, Quality>,
  // deno-lint-ignore no-explicit-any
): Deck<any, any, any> {
  const [fieldRow, ...cardRows] = tsv.split('\n')
  const fields = fieldRow.split('\t')
  return fromArray(
    cardRows
      .map((row) => row.split('\t'))
      .filter((row) => row.length === fields.length),
    scheduler,
    { fields },
  )
}

export function toTsv(
  // deno-lint-ignore no-explicit-any
  deck: Deck<any, any, any>,
  options: { fields?: string[] },
): string {
  const fields = Object.freeze(options.fields || deck.cards[0].content)
  const arr = toArray(deck, {
    fields,
    flatten: true,
  }) as Array<number | string>[]

  let tsv = fields.join('\t') + '\n'

  arr.forEach((row: Array<string | number>) => {
    tsv += row.map(format).join('\t') + '\n'
  })

  return tsv
}

function format(str: string | number): string {
  return String(str).replace(/\t/g, ' ').replace(/\n/g, ' <br/> ')
}
