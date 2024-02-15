export default class Flashcard extends HTMLElement {
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
      }
      .front {

      }
      .back {
        visibility: none;
      }
    `

    const text = document.createElement('span')
    text.innerHTML = `
      <div class="card">
        <div class="front">Front of card</div>
        <div class="back">Back of card</div>
      </div>
    `

    shadow.appendChild(style)
    shadow.appendChild(text)
  }
}
