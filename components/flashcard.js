export default class Flashcard extends HTMLElement {
  static observedAttributes = [
    'question',
    'answer',
    'show',
  ]

  constructor() {
    super()
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
    this.cardEl = document.createElement('div')
    this.cardEl.className = 'card'

    this.questionEl = document.createElement('div')
    this.questionEl.className = 'question'
    this.questionEl.innerHTML = this.getAttribute('question')
    this.cardEl.appendChild(this.questionEl)

    this.answerEl = document.createElement('div')
    console.log(this.getAttribute('show'))
    this.answerEl.innerHTML = this.getAttribute('answer')
    this.answerEl.className = this.getAttribute('show') == 'true'
      ? 'answer'
      : 'answer hidden'
    this.cardEl.appendChild(this.answerEl)

    shadow.appendChild(style)
    shadow.appendChild(this.cardEl)
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (this.answerEl && (name === 'answer')) {
      this.answerEl.innerHTML = newValue
    } else if (this.questionEl && (name === 'question')) {
      this.questionEl.innerHTML = newValue
    } else if (name === 'show') {
      this.answerEl.className = newValue === 'true' ? 'answer' : 'answer hidden'
    }
  }
}
