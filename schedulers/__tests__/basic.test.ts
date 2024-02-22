import { assert, assertEquals, assertNotEquals } from 'jsr:@std/assert@0.216'
import basicScheduler from '../basic.ts'

const { init, filter, sort, update } = basicScheduler

Deno.test('init', () => {
  const s = init({})
  assertEquals(init(s).repetition, 0, 'should set default values')
  s.repetition = 2
  assertEquals(
    init(s).repetition,
    2,
    'should ignore values that are already set',
  )
})

Deno.test('filter', () => {
  let s = init({})
  assert(filter(s), 'true by default')
  for (let i = 0; i < 5; i++) s = update(s, 1)
  assert(filter(s) === false, 'no longer true if reps > 3')
})

Deno.test('sort', () => {
  const sA = init({})
  let sB = update(init({}), 1)

  assert(sort(sA, sB) < 0, 'sort by least # of repetitions')

  sB = update(sB, 1)
  let sum = 0
  for (let i = 0; i < 100; i++) sum += sort(sA, sB)
  assertNotEquals(sum, -100, 'sort randomly if the same repetition')
})

Deno.test('update', () => {
  let s = init({})

  s = update(s, 1)
  assertEquals(s.repetition, 1, 'increment rep if success')

  s = update(s, 0)
  assertEquals(s.repetition, 1, 'nothing happens if failure')

  s = update(s, 1)
  assertEquals(s.repetition, 2, 'increment rep if success')
  s = update(s, 1)
  assertEquals(s.repetition, 3, 'increment rep if success')
})
