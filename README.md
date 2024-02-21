# Flashcard Utils

Flashcard Utils are a set of utilities for creating and working with study flashcards. It provides structure so that you can focus on content, algorithms, or ui.

## Example

```jsx
import { fromJSON, toAPKG } from '@flashcard/adapters'
import { Deck, Note, Template } from '@flashcard/core'
import { Flashcard } from '@flashcard/components'
import { sm2 } from '@flashcard/schedulers'

const deck = fromTSV(`
  Emoji	English	Spanish
  🍎	apple	manzana
  🍊	orange	naranja
  🍋	lemon	limón
`, {
  meta: {
    id: 'fruits-veggies-español',
    name: 'Frutas y Verduras',
    desc: 'A deck of English/Español fruits and veggies'
  }
})

deck.addTemplate(new Template('Reading', '{{Spanish}}', '{{English}}'))
deck.addTemplate(new Template('Speaking', '{{Emoji}}', '{{Spanish}}'))

deck.addNote(new Note("🍓", {
  content: { Emoji: "🍓", English: "strawberry", Spanish: "fresa" }
}))

// You can build an app, using the scheduler and built in web components...
deck.scheduler = sm2 // Use Supermemo 2, or even make your own scheduler!

function AppWithWebComponent() {
  const currCard = deck.getCurrent()
  return (
    <div>
      <flash-card
        question={currCard.renderQuestion()}
        answer={currCard.renderAnswer()}
        flipped={false}
        onClick={() => /* Do some logic to set `flipped` */}
      />
      <button onClick={() => currCard.answer(0)}>Fail!</button>
      <button onClick={() => currCard.answer(3)}>Decent!</button>
      <button onClick={() => currCard.answer(5)}>Perfect!</button>
    </div>
  )
}

// Or export to another format to use with other flashcard apps!
Deno.writeFile('my-deck.apkg', await toAPKG(deck))
```
