import { assert, assertEquals, assertNotEquals } from 'jsr:@std/assert'
import { FakeTime } from 'jsr:@std/testing/time'
import { filter, init, sort, update } from '../sm2.ts'
import Card from '../../models/card.ts'
import Note from '../../models/note.ts'

const ms = 1500000000000
const oneDayMS = 86_400_000
const content = { question: 'question', answer: 'answer' }
const note = new Note({ id: 'my-note', content })

Deno.test('init', () => {
  const card = new Card('my-card', note)
  assertEquals(card.scheduling, {}, 'no scheduling data on default card')

  assertEquals(
    init(card).scheduling,
    { efactor: 2.5, repetition: 0, interval: 0 },
    'should set default values',
  )

  card.scheduling = { efactor: 2, repetition: 2, interval: 2 }

  assertEquals(
    init(card).scheduling,
    { efactor: 2, repetition: 2, interval: 2 },
    'should ignore values that are already set',
  )
})

Deno.test('filter', () => {
  const time = new FakeTime(ms)

  try {
    const card = new Card('my-card', note)
    assert(filter(card), 'true by default')

    for (let i = 0; i < 3; i++) update(card, 3)
    assert(filter(card), 'still true for all reps < quality 4')

    assert(filter(update(card, 4)) === false, 'false for quality >= 4')
    time.tick(oneDayMS)
    assert(filter(card), 'true again after the interval passes')

    for (let i = 0; i < 3; i++) update(card, 5)

    time.tick(oneDayMS * 10)
    assert(filter(card) === false, 'false after waiting some time < interval')

    time.tick(oneDayMS * 20)
    assert(filter(card), 'true again after waiting for full interval')
  } finally {
    time.restore()
  }
})

Deno.test('sort', () => {
  const cardA = new Card('my-card', note)
  const cardB = new Card('my-card', note)
  update(cardA, 4) // int = 1
  update(cardB, 4) // int = 1

  let sum = 0
  for (let i = 0; i < 20; i++) sum += sort(cardA, cardB)
  assertNotEquals(sum, -20, 'On the same day, sort randomly')

  update(cardA, 2) // int = 0
  update(cardB, 4) // int = 4
  assert(sort(cardA, cardB) < 0, 'sort by due date')
})

Deno.test('update', () => {
  const time = new FakeTime(ms)
  const lastStudied = new Date(ms)

  try {
    const card = new Card('my-card', note)
    assertEquals(card.scheduling, {}, 'no scheduling data on default card')

    assertEquals(
      update(card, 5).scheduling,
      { efactor: 2.6, repetition: 1, interval: 1, lastStudied },
      'First successful repetition set rep = 1, int = 1',
    )

    assertEquals(
      update(card, 5).scheduling,
      { efactor: 2.7, repetition: 2, interval: 6, lastStudied },
      'Second successful repetition set rep = 2, int = 6',
    )

    assertEquals(update(card, 5).scheduling.interval, 16, 'third rep: int')
    assertEquals(update(card, 5).scheduling.interval, 45, 'fourth rep: int')
    assertEquals(update(card, 5).scheduling.repetition, 5, 'fifth rep: rep')

    assertEquals(card.scheduling.efactor, 3.0000000000000004)
    update(card, 0)
    assertEquals(
      card.scheduling,
      { efactor: 3.0000000000000004, repetition: 0, interval: 0, lastStudied },
      'quality < 3 should reset reps and interval, but maintain ef',
    )

    update(card, 3)
    assertEquals(
      card.scheduling,
      { efactor: 2.8600000000000003, repetition: 0, interval: 0, lastStudied },
      'quality == 3 should reset reps = 0, interval = 0 but update ef',
    )

    for (let i = 0; i < 3; i++) update(card, 5)
    time.tick(oneDayMS)
    assertEquals(card.scheduling.interval, 18, 'reset interval for next test')

    update(card, 3)
    assertEquals(card.scheduling.lastStudied, new Date(ms + oneDayMS), 'day++')
    assertEquals(card.scheduling.interval, 1, 'next-day q < 4 sets int = 1')

    for (let i = 0; i < 15; i++) update(card, 3)
    assertEquals(card.scheduling.efactor, 1.3, 'EF should never drop below 1.3')
  } finally {
    time.restore()
  }
})
