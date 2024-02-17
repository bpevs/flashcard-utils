export default class Flashcard extends HTMLElement {
  answerEl: HTMLDivElement
  cardEl: HTMLDivElement
  questionEl: HTMLDivElement

  static observedAttributes = [
    'question',
    'answer',
    'show',
  ]

  constructor() {
    super()
    this.cardEl = document.createElement('div')
    this.questionEl = document.createElement('div')
    this.answerEl = document.createElement('div')
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')

    style.textContent = `
      .card {
        padding: 20px;
        border: 1px solid black;
        border-radius: 10px;
        display: inline-block;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }
      .hidden {
        opacity: 0;
      }
    `

    const showAnswer = this.getAttribute('show') == 'true'

    this.cardEl.className = 'card'
    this.questionEl.className = 'question'
    this.answerEl.className = showAnswer ? 'answer' : 'answer hidden'

    this.answerEl.innerHTML = this.getAttribute('answer') || ''
    this.questionEl.innerHTML = this.getAttribute('question') || ''

    this.cardEl.appendChild(this.questionEl)
    this.cardEl.appendChild(this.answerEl)

    shadow.appendChild(style)
    shadow.appendChild(this.cardEl)
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (this.answerEl && (name === 'answer')) {
      this.answerEl.innerHTML = newValue
    } else if (this.questionEl && (name === 'question')) {
      this.questionEl.innerHTML = newValue
    } else if (name === 'show') {
      this.answerEl.className = newValue === 'true' ? 'answer' : 'answer hidden'
    }
  }
}
