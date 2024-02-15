export default class Template {
  id: string
  front: string
  back: string
  style: string

  constructor(id: string, front: string, back: string, style = '') {
    this.id = id
    this.front = front
    this.back = back
    this.style = style
  }
}
