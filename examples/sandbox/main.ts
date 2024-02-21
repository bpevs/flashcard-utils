/**
 * This script is mostly just for testing out usage of local development of
 * `flashcards`. Since this app is for internal testing, there is additional
 * code that is used for serving the `flashcards` import locally. You do
 * not need this if you are just using the stable `flashcards`.
 */

import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'
import { join } from 'jsr:@std/path@0.216'

const app = new Hono()
const root = './examples/sandbox'

// THIS IS UNNECESSARY FOR NORMAL USE. It is just for live reload of dev code
app.get('flashcard/core/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [core] = await build()
  return c.body(core.text)
})

app.get('flashcard/adapters/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [_core, adapters] = await build()
  return c.body(adapters.text)
})

app.get('flashcard/components/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [_core, _adapters, components] = await build()
  return c.body(components.text)
})

app.get('flashcard/schedulers/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [_core, _adapters, _components, schedulers] = await build()
  return c.body(schedulers.text)
})

app.get('/', serveStatic({ path: join(root, './index.html') }))
app.use('/*', serveStatic({ root }))

Deno.serve(app.fetch)
