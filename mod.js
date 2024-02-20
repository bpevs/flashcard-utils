// components/flashcard.ts
var Flashcard = class extends HTMLElement {
  cardEl
  cardContentEl
  answerEl
  questionEl
  static observedAttributes = [
    'question',
    'answer',
    'flipped',
  ]
  constructor() {
    super()
    this.cardEl = document.createElement('div')
    this.cardContentEl = document.createElement('div')
    this.answerEl = document.createElement('div')
    this.questionEl = document.createElement('div')
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
      .card {
        overflow: hidden;
        cursor: pointer;
        user-select: none;
        perspective: 1000;
        -webkit-user-select: none;
      }
      .card-content {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transform-style: preserve-3d;
      }
      .question, .answer {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        position: absolute;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transition: transform 0.3s;
        transform-style: preserve-3d;
      }
      .question {
        background-color: #bbb;
        color: black;
      }
      .question.flipped {
        transform: rotateY(180deg);
      }
      .answer {
        background-color: rebeccapurple;
        color: white;
        transform: rotateY(180deg);
      }
      .answer.flipped {
        transform: rotateY(0deg);
      }
    `
    const isFlipped = this.getAttribute('flipped') == 'true'
    this.cardEl.className = isFlipped ? 'card' : 'card'
    this.cardContentEl.className = isFlipped ? 'card-content' : 'card-content'
    this.questionEl.className = isFlipped ? 'question flipped' : 'question'
    this.answerEl.className = isFlipped ? 'answer flipped' : 'answer'
    this.answerEl.innerHTML = this.getAttribute('answer') || ''
    this.questionEl.innerHTML = this.getAttribute('question') || ''
    this.cardContentEl.appendChild(this.questionEl)
    this.cardContentEl.appendChild(this.answerEl)
    this.cardEl.appendChild(this.cardContentEl)
    shadow.appendChild(style)
    shadow.appendChild(this.cardEl)
  }
  attributeChangedCallback(name2, _oldValue, newValue) {
    if (this.answerEl && name2 === 'answer') {
      this.answerEl.innerHTML = newValue
    } else if (this.questionEl && name2 === 'question') {
      this.questionEl.innerHTML = newValue
    } else if (name2 === 'flipped') {
      const isFlipped = newValue == 'true'
      this.questionEl.className = isFlipped ? 'question flipped' : 'question'
      this.answerEl.className = isFlipped ? 'answer flipped' : 'answer'
    }
  }
}

// models/template.ts
var DEFAULT_ANKI_STYLE = `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}`
var Template = class {
  id
  type
  question
  answer
  style
  constructor(id, question, answer, style = DEFAULT_ANKI_STYLE) {
    this.type = 'ANKI'
    this.id = id
    this.question = question
    this.answer = answer
    this.style = style
  }
  renderQuestion(content) {
    if (this.type === 'ANKI') {
      let question = this.question
      for (const key in content) {
        question = question.replace(`{{${key}}}`, content[key])
      }
      return question
    }
    return ''
  }
  renderAnswer(content) {
    if (this.type === 'ANKI') {
      let answer = this.answer
      for (const key in content) {
        answer = answer.replace(`{{${key}}}`, content[key])
      }
      return answer
    }
    return ''
  }
}

// models/card.ts
var basicTemplate = new Template(
  'basic',
  '{{question}}',
  '{{answer}}',
)
var Card = class {
  id
  template
  note
  scheduling
  constructor(id, note, template = basicTemplate, scheduling = {}) {
    this.id = id
    this.note = note
    this.template = template
    this.scheduling = scheduling
  }
  renderQuestion() {
    return this.template.renderQuestion(this.note.content)
  }
  renderAnswer() {
    return this.template.renderAnswer(this.note.content)
  }
  answer(deck, quality) {
    const { name: name2, init: init2, update: update2 } = deck.scheduler
    this.scheduling[name2] = update2(init2(this.scheduling[name2]), quality)
    return this.scheduling[name2]
  }
}

// https://jsr.io/@std/collections/0.216.0/_utils.ts
function filterInPlace(array, predicate) {
  let outputIndex = 0
  for (const cur of array) {
    if (!predicate(cur)) {
      continue
    }
    array[outputIndex] = cur
    outputIndex += 1
  }
  array.splice(outputIndex)
  return array
}

// https://jsr.io/@std/collections/0.216.0/intersect.ts
function intersect(...arrays) {
  const [originalHead, ...tail] = arrays
  const head = [...new Set(originalHead)]
  const tailSets = tail.map((it) => new Set(it))
  for (const set of tailSets) {
    filterInPlace(head, (it) => set.has(it))
    if (head.length === 0) {
      return head
    }
  }
  return head
}

// schedulers/sm2.ts
var EF = 2.5
var REPETITION = 0
var INTERVAL = 0
var name = 'sm2'
var sm2_default = { name, init, filter, sort, update }
function init({ efactor, repetition, interval } = {}) {
  return {
    efactor: efactor ?? EF,
    repetition: repetition ?? REPETITION,
    interval: interval ?? INTERVAL,
  }
}
function filter(s) {
  const due = getDueDate(s)
  return !due || due <= /* @__PURE__ */ new Date()
}
function sort(sA, sB) {
  init(sA)
  init(sB)
  const aDue = getDueDate(sA)
  const bDue = getDueDate(sB)
  if (!aDue && bDue) {
    return -1
  }
  if (!bDue && aDue) {
    return 1
  }
  if (!aDue || !bDue) {
    return Math.random() - 0.5
  }
  if (sameDay(aDue, bDue)) {
    return Math.random() - 0.5
  }
  return aDue.getDate() - bDue.getDate()
}
function update({
  efactor: prevEfactor = EF,
  repetition: prevRepetition = REPETITION,
  interval: prevInterval = INTERVAL,
  lastStudied: prevLastStudied,
}, quality) {
  const efactorModifier = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  const efactor = Math.max(1.3, prevEfactor + efactorModifier)
  const lastStudied = /* @__PURE__ */ new Date()
  if (quality < 4) {
    const studiedToday = sameDay(prevLastStudied || lastStudied, lastStudied)
    return {
      efactor: quality < 3 ? prevEfactor : efactor,
      lastStudied,
      interval: studiedToday ? 0 : Math.min(1, prevInterval),
      repetition: 0,
    }
  } else if (prevRepetition === 0) {
    return { efactor, lastStudied, interval: 1, repetition: 1 }
  } else if (prevRepetition === 1) {
    return { efactor, lastStudied, interval: 6, repetition: 2 }
  } else {
    return {
      efactor,
      lastStudied,
      interval: Math.round(prevInterval * prevEfactor),
      repetition: prevRepetition + 1,
    }
  }
}
function getDueDate(s) {
  if (!s.lastStudied) {
    return null
  }
  const due = new Date(s.lastStudied)
  due.setDate(due.getDate() + (s.interval ?? INTERVAL))
  return due
}
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

// models/deck.ts
var Deck = class {
  id
  idNum
  // For exports that use id number (Anki)
  name
  desc
  notes
  scheduler
  content
  meta
  constructor(
    { id, idNum, name: name2, desc, content, meta, scheduler, notes },
  ) {
    this.id = id
    this.idNum = idNum || encode(id)
    this.name = name2
    this.desc = desc
    this.notes = notes || {}
    this.content = content
    this.scheduler = scheduler || sm2_default
    if (meta) {
      this.meta = meta
    }
  }
  get templates() {
    return Object.values(this.notes)[0].templates || []
  }
  get cards() {
    const { init: init2, sort: sort2, name: name2 } = this.scheduler
    return Object.values(this.notes).map((note) => note.cards).flat().toSorted(
      (cardA, cardB) =>
        sort2(
          init2(cardA.scheduling[name2]),
          init2(cardB.scheduling[name2]),
        ),
    )
  }
  getCurrent() {
    const { init: init2, filter: filter2, name: name2 } = this.scheduler
    return this.cards.filter((card) => {
      return filter2(init2(card.scheduling[name2]))
    })[0]
  }
  answerCurrent(quality) {
    const currCard = this.getCurrent()
    currCard.answer(this, quality)
  }
  addNote(note) {
    const noteFields = Object.keys(note.content)
    const commonFields = intersect(noteFields, this.content.fields)
    if (commonFields.length !== this.content.fields.length) {
      throw new Error(`mismatched number of fields, ${this.content.fields}`)
    }
    this.notes[note.id] = note
  }
  addTemplate(template) {
    Object.values(this.notes).forEach((note) => note.templates.push(template))
  }
}
function encode(str) {
  let num = ''
  for (let i = 0; i < str.length; i++) {
    num = num + String(str.charCodeAt(i))
  }
  return parseInt(num.slice(0, 10))
}

// models/note.ts
var Note = class {
  id
  attachments
  _cards
  templates
  content
  constructor({ id, content, templates }) {
    this.id = id
    this.content = content
    this.attachments = {}
    this.templates = templates || []
    this._cards = /* @__PURE__ */ new Map()
  }
  get cards() {
    if (this.templates.length > this._cards.size) {
      this.templates.forEach((template) => {
        if (!this._cards.get(template)) {
          this._cards.set(
            template,
            new Card(this.id + template.id, this, template),
          )
        }
      })
    }
    return Array.from(this._cards, ([_template, card]) => card)
  }
}
export { Card, Deck, Flashcard, Note, Template }
