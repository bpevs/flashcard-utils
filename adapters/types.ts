export interface ExportObj {
  id: string
  idNum?: number
  name: string
  desc: string
  meta?: { [key: string]: string }
  fields: string[] // Names of different content fields
  watch?: string[] // Names of fields that are watched for updates
  notes: Array<Array<string | number>>
}
