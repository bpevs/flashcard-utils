/** @jsx jsx */
import { Hono } from 'npm:hono'
import { jsx } from 'npm:hono/jsx'
import { html } from 'npm:hono/html'
import { serveStatic } from 'npm:@hono/node-server/serve-static'

import data from './__data__/zh_CN.ts'
import fromObj from '../adapters/from_obj.ts'
import Template from '../models/template.ts'

const app = new Hono()

const deck = fromObj(data)
const template = new Template('basic', '{{emoji}}', '{{text}}')
Object.values(deck.notes).forEach((note) => {
  note.templates.push(template)
})

app.get('/', (c) => {
  const card = deck.getCurrent()
  return c.html(
    <html>
      <head>
        <style>{`a { padding: 10px; }`}</style>
      </head>
      <body>
        <flash-card
          id='flashcard'
          question={card ? card.renderQuestion() : 'No Cards Left'}
          answer={card ? card.renderAnswer() : ''}
        />
        {!card ? '' : (
          <div>
            <a href='/answer/0'>hard</a>
            <a href='/answer/3'>normal</a>
            <a href='/answer/5'>easy</a>
          </div>
        )}

        <script type='module'>
          {html`
          import Flashcard from './components/flashcard.js'
          customElements.define("flash-card", Flashcard);

          let showCard = false
          const cardEl = document.getElementById('flashcard')
          cardEl.onclick = () => {
            showCard = !showCard
            cardEl.setAttribute('show', showCard)
          }
        `}
        </script>
      </body>
    </html>,
  )
})

app.get('/answer/:quality', (c) => {
  const quality = Number(c.req.param('quality'))
  deck.answerCurrent(quality)
  return c.redirect('/')
})

app.use('/*', serveStatic({ root: './' }))

Deno.serve(app.fetch)
