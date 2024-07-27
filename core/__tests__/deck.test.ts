import { assert, assertArrayIncludes, assertEquals } from '@std/assert'
import basic, {
  type Quality,
  type ScheduleCache,
} from '../../schedulers/basic.ts'
import Card from '../card.ts'
import Deck from '../deck.ts'

const suits: readonly string[] = Object.freeze(['♣️', '♦️', '♥️', '♠️'])
const values: readonly string[] = Object.freeze('123456789TJQKA'.split(''))

interface PlayingCard {
  suit: string
  value: string
}

function createCardDeck() {
  const deck = new Deck<PlayingCard, ScheduleCache, Quality>(basic)

  suits.forEach((suit) => {
    values.forEach((value) => {
      const content = { suit, value: String(value) }
      deck.addCard(content.suit + content.value, content)
    })
  })
  return deck
}

Deno.test('add and get cards', () => {
  const deck = createCardDeck()
  const cards = deck.getNext()

  assertEquals(cards.length, 56)

  cards.forEach((card) => {
    assert(card instanceof Card, 'Received next card')
    const { suit, value } = card.content
    assertArrayIncludes(suits, [suit], 'Card has suit')
    assertArrayIncludes(values, [value], 'Card has suit')
  })
})

Deno.test('answer card', () => {
  const deck = createCardDeck()
  const cards = deck.getNext()

  assertEquals(cards.length, 56)

  cards.forEach((card) => {
    card.answer(deck.scheduler, 1)
    card.answer(deck.scheduler, 1)
    card.answer(deck.scheduler, 1)
  })
  assertEquals(deck.getNext().length, 0)
})
