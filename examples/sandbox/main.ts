/**
 * This script is mostly just for testing out usage of local development of
 * `flashcards`. Since this app is for internal testing, there is additional
 * code that is used for serving the `flashcards` import locally. You do
 * not need this if you are just using the stable `flashcards`.
 */

import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'
import { join } from 'https://deno.land/std@0.216.0/path/mod.ts'

const app = new Hono()
const root = './examples/sandbox'

// THIS IS UNNECESSARY FOR NORMAL USE. It is just for live reload of dev code
app.get('flashcards/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [main] = await build()
  return c.body(main.text)
})

// THIS IS UNNECESSARY FOR NORMAL USE. It is just for live reload of dev code
app.get('flashcards/adapters/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [_main, adapters] = await build()
  return c.body(adapters.text)
})

app.get('/', serveStatic({ path: join(root, './index.html') }))
app.use('/*', serveStatic({ root }))

Deno.serve(app.fetch)
