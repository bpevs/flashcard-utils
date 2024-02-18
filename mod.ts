export { default as Flashcard } from './components/flashcard.ts'
export { default as Card } from './models/card.ts'
export { default as Deck } from './models/deck.ts'
export { default as Note } from './models/note.ts'
export { default as Template } from './models/template.ts'
export * from './models/types.ts'

import * as basic from './schedulers/basic.ts'
import * as sm2 from './schedulers/sm2.ts'

export const schedulers = { basic, sm2 }
