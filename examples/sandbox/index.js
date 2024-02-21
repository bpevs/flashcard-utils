import { Template } from '@flashcard/core'
import { Flashcard } from '@flashcard/components'
import { fromJSON } from '@flashcard/adapters'
import { basic } from '@flashcard/schedulers'

customElements.define('flash-card', Flashcard)

const containerEl = document.getElementById('container')
const cardsEl = document.getElementById('cards')
const buttonsEl = document.getElementById('buttons')
const correctButtonEl = document.getElementById('correct')
const incorrectButtonEl = document.getElementById('incorrect')

let currCardEl

fetch('/data.json').then((resp) => resp.text()).then(function setup(data) {
  const deck = fromJSON(data, { sortField: 'emoji' })
  deck.scheduler = basic
  deck.addTemplate(
    new Template('basic', '<h1>{{emoji}}</h1>', '<h1>{{text}}</h1>'),
  )

  currCardEl = renderCurrCard(deck)

  correctButtonEl.onclick = () => {
    deck.answerCurrent(1)
    currCardEl.classList.remove('show')
    buttonsEl.classList.remove('show')
  }

  incorrectButtonEl.onclick = () => {
    deck.answerCurrent(0)
    currCardEl.classList.remove('show')
    buttonsEl.classList.remove('show')
  }
})

function renderCurrCard(deck) {
  const currCard = deck.getCurrent()
  const { cardEl, cardWrapperEl } = addFlashcard(deck)
  if (currCard) {
    cardEl.setAttribute('question', currCard.renderQuestion())
    cardEl.setAttribute('answer', currCard.renderAnswer())
    cardsEl.appendChild(cardWrapperEl)
    setTimeout(() => cardWrapperEl.classList.add('show'), 0)
  } else {
    containerEl.innerHTML = 'No cards left! Refresh to reset.'
  }
  return cardWrapperEl
}

function addFlashcard(deck) {
  const cardWrapperEl = document.createElement('div')
  cardWrapperEl.className = 'card-wrapper'
  // On finished animating hide, delete the card element and render next
  cardWrapperEl.ontransitionend = (e) => {
    if (!e.target.className.includes('show')) {
      cardsEl.removeChild(e.target)
      currCardEl = renderCurrCard(deck)
    }
  }

  const cardEl = document.createElement('flash-card')
  cardEl.setAttribute('flipped', 'false')
  cardEl.onclick = () => {
    const isFlipped = cardEl.getAttribute('flipped') == 'true' ? true : false
    cardEl.setAttribute('flipped', String(!isFlipped))
    buttonsEl.classList.add('show')
  }

  cardWrapperEl.appendChild(cardEl)

  return { cardWrapperEl, cardEl }
}
