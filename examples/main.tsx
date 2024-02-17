/** @jsx jsx */
import { Hono } from 'npm:hono'
import { jsx } from 'npm:hono/jsx'
import { html } from 'npm:hono/html'
import { serveStatic } from 'npm:@hono/node-server/serve-static'
import build from '../build.ts'

import data from './__data__/zh_CN.ts'
import fromOBJ from '../adapters/from_obj.ts'
import Template from '../models/template.ts'

const app = new Hono()

const deck = fromOBJ(data, { sortField: 'emoji' })
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
          import { Flashcard } from '/mod.js'
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

// The only reason this exists is to re-build this library for development
// You do not need this build script for your app if you do a normal import
app.get('/mod.js', async (c) => {
  c.header('Content-Type', 'application/javascript')
  const [baseJS, _adaptersJS] = await build()
  return c.body(baseJS.text)
})

app.use('/*', serveStatic({ root: './' }))

Deno.serve(app.fetch)
