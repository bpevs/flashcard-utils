export type Meta = { [key: string]: string }

export interface ExportObj {
  id: string
  idNum?: number
  name: string
  desc: string
  meta?: Meta
  content: {
    fields: string[] // Names of different content fields
    watch?: string[] // Names of fields that are watched for updates
  }
  notes: Array<string[]>
}
