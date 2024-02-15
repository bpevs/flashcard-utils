/** @jsx jsx */

import { Hono } from 'npm:hono'
import { jsx } from 'npm:hono/jsx'
import { html } from 'npm:hono/html'
import { serveStatic } from 'npm:@hono/node-server/serve-static'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <html>
      <language-flashcard>
      </language-flashcard>

      <script type='module'>
        {html`
        import Flashcard from './components/flashcard.js'
        customElements.define("language-flashcard", Flashcard);
      `}
      </script>
    </html>,
  )
})

app.use('/*', serveStatic({ root: './' }))

Deno.serve(app.fetch)
