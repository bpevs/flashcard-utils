import type { NoteContent } from './note.ts'

/**
 * Template that describes how cards are displayed.
 * @todo add support for JSX-style templates for web via func
 */
export enum TemplateType {
  'JSX' = 0,
  'ANKI',
}

export default class Template {
  id: string
  type: TemplateType
  question: string
  answer: string
  style: string

  constructor(
    id: string,
    question: string,
    answer: string,
    type = TemplateType.ANKI,
    style: string = `.card {
      font-family: arial;
      font-size: 20px;
      text-align: center;
      color: black;
      background-color: white;
    }`,
  ) {
    this.id = id
    this.question = question
    this.answer = answer
    this.type = type
    this.style = style
  }

  render(
    content: NoteContent,
  ): { question: string; answer: string } {
    if (this.type === TemplateType.ANKI) {
      let question = this.question
      let answer = this.answer
      for (const key in content) {
        const replacer = new RegExp(`{{${key}}}`, 'g')
        question = question.replace(replacer, String(content[key]))
        answer = answer.replace(replacer, String(content[key]))
      }
      return { question, answer }
    }
    if (this.type === TemplateType.JSX) {
      console.warn('JSX Templating is not currently supported')
      return { question: '', answer: '' }
    }
    return { question: '', answer: '' }
  }
}
