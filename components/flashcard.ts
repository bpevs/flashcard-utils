export default class Flashcard extends HTMLElement {
  cardEl: HTMLDivElement
  cardContentEl: HTMLDivElement
  answerEl: HTMLElement
  questionEl: HTMLElement

  static observedAttributes = [
    'question',
    'answer',
    'flipped',
  ]

  constructor() {
    super()
    this.cardEl = document.createElement('div')
    this.cardContentEl = document.createElement('div')
    this.answerEl = document.createElement('h1')
    this.questionEl = document.createElement('h1')
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')

    style.textContent = `
      .card {
        overflow: hidden;
        width: 200px;
        height: 200px;
        margin: 20px;
        display: inline-block;
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

    const isFlipped = this.getAttribute('flipped') == 'false'

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

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (this.answerEl && (name === 'answer')) {
      this.answerEl.innerHTML = newValue
    } else if (this.questionEl && (name === 'question')) {
      this.questionEl.innerHTML = newValue
    } else if (name === 'flipped') {
      const isFlipped = newValue == 'true'
      this.questionEl.className = isFlipped ? 'question flipped' : 'question'
      this.answerEl.className = isFlipped ? 'answer flipped' : 'answer'
    }
  }
}
