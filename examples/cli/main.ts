import { Deck, Scheduler } from 'jsr:@flashcard/core'

interface ScheduleCache {
  level: number
  repetition: number
}

type Quality = 0 | 1

const levelScheduler: Scheduler<ScheduleCache, Quality> = new Scheduler<
  ScheduleCache,
  Quality
>({
  name: 'level',

  init(s: ScheduleCache = { repetition: 0, level: 0 }) {
    return { repetition: s.repetition || 0, level: s.level || 0 }
  },

  filter({ repetition = 0, level = 0 }: ScheduleCache) {
    if (getUserLevel() < level) return false
    return repetition < 8
  },

  // Sort by least-repeated. If they are the same, then sort randomly!
  sort(sA: ScheduleCache, sB: ScheduleCache): number {
    return (sA.repetition - sB.repetition) || (Math.random() - 0.5)
  },

  // If answered correctly, increment the repetition
  // If answered incorrectly, decrement the repetition
  update({ repetition }: ScheduleCache, quality: Quality) {
    if (quality) return { repetition: repetition + 1 }
    else return { repetition: Math.max(repetition - 1, 0) }
  },
})

/**
 * Hiragana Practice CLI
 *
 * This example demonstrates usage of:
 *   - CLI integration
 *   - "level" unlocking
 *   - "batch" study sessions
 *   - utilizing saved user-data
 */

/**
 * On script start:
 *   - load json files
 *   - determine user level
 */
const deck = new Deck('hiragana', {
  fields: ['kana', 'romaji', 'english', 'kanji'],
})
deck.addTemplate('basic', '', '')

deck.scheduler = levelScheduler
;[
  './data/01_aka.json',
  './data/02_sata.json',
  './data/03_naha.json',
].map((filepath, index) => {
  const levelNum = index + 1
  const levelKana = new Set()
  const levelData = JSON.parse(Deno.readTextFileSync(filepath))
  levelData.notes.forEach(([kana, romaji, english, kanji]) => {
    levelKana.add(kana)
    deck.addNote(kana, { kana, romaji, english, kanji })
  })
  deck.getCards().forEach((card) => {
    if (levelKana.has(card.content.kana)) {
      card.scheduling = card.scheduling || {}
      card.scheduling['level'] = card.scheduling['level'] || {}
      card.scheduling['level'] = levelScheduler.init({ level: levelNum })
    }
  })
})

console.log('level: ', getUserLevel())
console.log('cards to study: ', deck.getNext(0).length)

study()

/**
 * Start a study lesson.
 *   - determine how many cards are available to study
 */
function study() {
  const toStudy = [...deck.getNext()]
  const missed = new Set()
  const numTotal = toStudy.length
  let numCorrect = 0
  console.log()
  for (let i = 0; i < toStudy.length; i++) {
    const card = toStudy[i]
    const { kana, romaji } = card.content
    const answer = prompt(kana, '')
    const isCorrect = answer === romaji
    if (isCorrect) {
      console.log('Correct!')
      numCorrect++
      // if correct, and never missed, mark as true
      // if correct, but missed before, just continue
      if (!missed.has(kana)) card.answer(true)
      else missed.delete(kana)
    } else {
      console.log('Incorrect! Correct answer: ', romaji)
      // if never missed, mark as false and re-add to end
      if (!missed.has(kana)) {
        card.answer(false)
        missed.add(kana)
      }
      toStudy.push(card)
    }
    console.log(numCorrect + ' / ' + numTotal)
  }
  console.log('complete!')
}

/**
 * Determine the level of the user:
 *   - savedLevel = locally saved level number
 *   - calculatedLevel = all cards of previous level have `repetition > 4`
 */
function getUserLevel(): number {
  const savedLevel = parseInt(localStorage.getItem('level')) || 1
  let calculatedLevel = Infinity

  deck.getCards().forEach((card) => {
    const { level, repetition } = card.scheduling.level
    if (!repetition || repetition < 3) {
      calculatedLevel = Math.min(calculatedLevel, level)
    }
  })

  if (calculatedLevel === Infinity) throw new Error('No card levels defined')

  return Math.max(savedLevel, calculatedLevel)
}
