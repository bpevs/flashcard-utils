export interface NoteData {
  [key: string]: string
}

// Contains ll the data necessary to create a flashcard.
// Essentially, a "row" of the Deck.
// A note may contain multiple cards
export default class Note {
  id: string
  attachments: { [key: string]: string }
  data: NoteData

  constructor({ id, data }: { id: string; data: NoteData }) {
    this.id = id
    this.data = data
    this.attachments = {}
  }
}
