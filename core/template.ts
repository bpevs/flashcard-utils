import type { Content } from './note.ts'

/**
 * Template that describes how cards are displayed.
 * @todo add support for JSX-style templates for web via func
 */
const DEFAULT_ANKI_STYLE = `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}`

export default class Template {
  id: string
  type: 'ANKI' | 'JSX'
  question: string
  answer: string
  style: string

  constructor(
    id: string,
    question: string,
    answer: string,
    style = DEFAULT_ANKI_STYLE,
  ) {
    this.type = 'ANKI'
    this.id = id
    this.question = question
    this.answer = answer
    this.style = style
  }

  renderQuestion(content: Content): string {
    if (this.type === 'ANKI') {
      let question = this.question
      for (const key in content) {
        question = question.replace(`{{${key}}}`, content[key])
      }
      return question
    }
    return ''
  }

  renderAnswer(content: Content): string {
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
