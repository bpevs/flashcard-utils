export interface NoteData {
  [key: string]: string
}

// Contains ll the data necessary to create a flashcard.
// Essentially, a "row" of the Deck.
// A note may contain multiple cards
export default class Note {
  id: string
  data: NoteData

  constructor({ data }: { data: NoteData }) {
    this.id = 'some-card-id'
    this.data = data
  }
}
