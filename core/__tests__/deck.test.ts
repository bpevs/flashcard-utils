import { Card, Deck } from 'jsr:@flashcard/core@0.0.3'
import { basic } from 'jsr:@flashcard/schedulers@0.0.3'
import { assert } from 'jsr:@std/assert@0.216'

/**
 * DECK
 *   Sample Use-cases
 *     - Tinder (random-sort, basic-grading)
 *     - Poker (random-sort, multiple-card output, static-deck-order, basic-grading)
 *     - Study SM2 (sm2-sort, sm2-grading)
 */
Deno.test('Basic', () => {
  const deckOfCards = new Deck('my-deck', { fields: ['suit', 'value'] })
  deckOfCards.scheduler = basic
  deckOfCards.addTemplate('card', '🚲', '{{value}}')

  const suits = ['♣️', '♦️', '♥️', '♠️']
  suits.forEach((suit) => {
    for (let value = 1; value < 15; value++) {
      const content = { suit, value: String(value) }

      if (value === 10) content.value = 'T'
      if (value === 11) content.value = 'J'
      if (value === 12) content.value = 'Q'
      if (value === 13) content.value = 'K'
      if (value === 14) content.value = 'A'

      deckOfCards.addNote(content.suit + content.value, content)
    }
  })

  const next = deckOfCards.getNext()
  assert(next instanceof Card, 'Received next card')
  assert(next.content.suit, 'Card has suit')
})
