import { assert, assertEquals, assertNotEquals } from 'jsr:@std/assert'
import { FakeTime } from 'jsr:@std/testing/time'
import { filter, init, S, sort, update } from '../sm2.ts'

const ms = 1500000000000
const oneDayMS = 86_400_000

Deno.test('init', () => {
  const s: S = {}
  assertEquals(
    init(s),
    { efactor: 2.5, repetition: 0, interval: 0 },
    'should set default values',
  )

  s.efactor = s.repetition = s.interval = 2

  assertEquals(
    init(s),
    { efactor: 2, repetition: 2, interval: 2 },
    'should ignore values that are already set',
  )
})

Deno.test('filter', () => {
  const time = new FakeTime(ms)
  let s: S = {}

  try {
    assert(filter(s), 'true by default')

    for (let i = 0; i < 3; i++) s = update(s, 3)
    assert(filter(s), 'still true for all reps < quality 4')

    s = update(s, 4)
    assert(filter(s) === false, 'false for quality >= 4')
    time.tick(oneDayMS)
    assert(filter(s), 'true again after the interval passes')

    for (let i = 0; i < 3; i++) s = update(s, 5)

    time.tick(oneDayMS * 10)
    assert(filter(s) === false, 'false after waiting some time < interval')

    time.tick(oneDayMS * 20)
    assert(filter(s), 'true again after waiting for full interval')
  } finally {
    time.restore()
  }
})

Deno.test('sort', () => {
  let sA = {}
  let sB = {}
  sA = update(sA, 4) // int = 1
  sB = update(sB, 4) // int = 1

  let sum = 0
  for (let i = 0; i < 100; i++) sum += sort(sA, sB)
  assertNotEquals(sum, -100, 'On the same day, sort randomly')

  sA = update(sA, 2) // int = 0
  sB = update(sB, 4) // int = 4
  assert(sort(sA, sB) < 0, 'sort by due date')
})

Deno.test('update', () => {
  const time = new FakeTime(ms)
  const lastStudied = new Date(ms)
  let s: S = {}

  try {
    s = update(s, 5)
    assertEquals(
      s,
      { efactor: 2.6, repetition: 1, interval: 1, lastStudied },
      'First successful repetition set rep = 1, int = 1',
    )

    s = update(s, 5)
    assertEquals(
      s,
      { efactor: 2.7, repetition: 2, interval: 6, lastStudied },
      'Second successful repetition set rep = 2, int = 6',
    )

    s = update(s, 5)
    assertEquals(s.interval, 16, 'third rep: int')
    s = update(s, 5)
    assertEquals(s.interval, 45, 'fourth rep: int')
    s = update(s, 5)
    assertEquals(s.repetition, 5, 'fifth rep: rep')

    assertEquals(s.efactor, 3.0000000000000004)
    s = update(s, 0)
    assertEquals(
      s,
      { efactor: 3.0000000000000004, repetition: 0, interval: 0, lastStudied },
      'quality < 3 should reset reps and interval, but maintain ef',
    )

    s = update(s, 3)
    assertEquals(
      s,
      { efactor: 2.8600000000000003, repetition: 0, interval: 0, lastStudied },
      'quality == 3 should reset reps = 0, interval = 0 but update ef',
    )

    for (let i = 0; i < 3; i++) s = update(s, 5)
    time.tick(oneDayMS)
    assertEquals(
      s.interval,
      18,
      'reset interval for next test',
    )

    s = update(s, 3)
    assertEquals(
      s.lastStudied,
      new Date(ms + oneDayMS),
      'day++',
    )
    assertEquals(s.interval, 1, 'next-day q < 4 sets int = 1')

    for (let i = 0; i < 15; i++) s = update(s, 3)
    assertEquals(
      s.efactor,
      1.3,
      'EF should never drop below 1.3',
    )
  } finally {
    time.restore()
  }
})
