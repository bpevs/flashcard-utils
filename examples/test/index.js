import { Flashcard, schedulers, Template } from 'flashcards'
import { fromJSON } from 'flashcards/adapters'
customElements.define('flash-card', Flashcard)

fetch('/data.json').then((resp) => resp.text()).then(setup)

let isFlipped = false
const containerEl = document.getElementById('container')
const cardEl = document.getElementById('flashcard')
const correctButtonEl = document.getElementById('correct')
const incorrectButtonEl = document.getElementById('incorrect')

cardEl.onclick = () => {
  isFlipped = !isFlipped
  cardEl.setAttribute('flipped', isFlipped)
}

function setup(data) {
  const deck = fromJSON(data, { sortField: 'emoji' })
  deck.scheduler = schedulers.basic
  deck.addTemplate(
    new Template(
      'basic-template',
      '<h1>{{emoji}}</h1>',
      '<h1>{{text}}</h1>',
    ),
  )

  renderCurrCard(deck)

  correctButtonEl.onclick = () => {
    deck.answerCurrent(1)
    renderCurrCard(deck)
  }

  incorrectButtonEl.onclick = () => {
    deck.answerCurrent(0)
    renderCurrCard(deck)
  }
}

function renderCurrCard(deck) {
  const currCard = deck.getCurrent()
  isFlipped = false
  cardEl.setAttribute('flipped', isFlipped)
  if (currCard) {
    cardEl.setAttribute('question', currCard.renderQuestion())
    cardEl.setAttribute('answer', currCard.renderAnswer())
  } else {
    containerEl.innerHTML = 'No cards left! Refresh to reset.'
  }
}
