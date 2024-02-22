# Flashcard Utils

Flashcard Utils is a set of utilities to make it easier to create apps around study flashcards. It provides structure so that you can focus on content, algorithms, ui, or whatever makes your idea unique!

## Importing

### Deno

If using **Deno**, you can simply import from [jsr.io](https://jsr.io/@flashcard)

```
import { Deck, Note, Template } from 'jsr:@flashcard/core'
```

<br />

### Node

If using **node.js**, you will have to add jsr to your package.json registries.
Add this line to the project's .npmrc file or the global one.

```
@jsr:registry=https://npm.jsr.io
```

And then install packages via:
```
npm install @jsr/flashcard__core
```

## Examples

### Flashcard code structure

```js
import { Deck, Note, Template } from 'jsr:@flashcard/core'
import { sm2 } from 'jsr:@flashcard/schedulers'

const deck = new Deck({
  id: "my-fruit-deck",
  name: "Fruits in English and Spanish",
  desc: "But only the ones I like",
  content: { fields: [ "Emoji", "English", "Spanish" ] },
})

deck.addNote(new Note("🍓", {
  content: { Emoji: "🍓", English: "strawberry", Spanish: "fresa" }
}))

// Add templates for different visual representations of a Note
deck.addTemplate(new Template('Reading', '<h1>{{Spanish}}</h1>', '{{English}}'))
deck.addTemplate(new Template('Speaking', '<h1>{{Emoji}}</h1>', '{{Spanish}}'))

// If you are building an app that needs card selection, you can
// use a pre-built scheduler (like Supermemo 2), or make your own!
deck.scheduler = sm2

// `getCurrent` here selects a card using the `sm2` algorithm
const currCard = deck.getCurrent()
currCard.answer(2)
```

### Import Decks

You can parse various data sources to import your decks, or store them in readable formats.
You can also export decks!

```js
import { fromJSON, fromTSV, toAPKG } from 'jsr:@flashcard/adapters'

// Import and export from JSON string
const resp = await fetch('/my-deck.json').then(resp => resp.json())
const deckA = fromJSON(resp)

// Import and export from TSV
const deckB = fromTSV(`
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

// You can even export into an Anki deck (but no importing quite yet)
Deno.writeFile('my-deck.apkg', await toAPKG(deckA))
```

# Components

We also have web components for creating your own app!
Use them in your Javascript framework of choice.

```jsx
import { FlashCard } from 'jsr:@flashcard/components'

customElements.define('flash-card', Flashcard)

export default function MyComponent() {
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
```

### More Examples

You can see more examples [in the examples directory](./examples)
