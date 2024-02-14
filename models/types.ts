export type Meta = { [key: string]: string | number }

export interface ExportObj {
  id: string
  name: string
  desc: string
  meta?: Meta
  columns: string[]
  notes: Array<string[]>
}
