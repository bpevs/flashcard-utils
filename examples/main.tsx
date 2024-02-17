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
        <style>
          {`
          a { padding: 10px; }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .hidden {
            display: none;
          }
        `}
        </style>
      </head>
      <body>
        <div class='container'>
          <flash-card
            id='flashcard'
            question={card ? card.renderQuestion() : 'No Cards Left'}
            answer={card ? card.renderAnswer() : ''}
          />
          {!card ? '' : (
            <div>
              <div id='answers' class='hidden'>
                <a href='/answer/0'>0</a>
                <a href='/answer/1'>1</a>
                <a href='/answer/2'>2</a>
                <a href='/answer/3'>3</a>
                <a href='/answer/4'>4</a>
                <a href='/answer/5'>5</a>
              </div>
              <button id='flip-button'>flip</button>
            </div>
          )}
        </div>

        <script type='module'>
          {html`
          import { Flashcard } from '/mod.js'
          customElements.define("flash-card", Flashcard);

          let isFlipped = false
          const cardEl = document.getElementById('flashcard')
          const answersEl = document.getElementById('answers')
          const flipButtonEl = document.getElementById('flip-button')

          const flip = () => {
            isFlipped = !isFlipped
            cardEl.setAttribute('flipped', isFlipped)
            answersEl.className = ''
            flipButtonEl.className = 'hidden'
          }
          cardEl.onclick = flip
          if (flipButtonEl) flipButtonEl.onclick = flip
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
