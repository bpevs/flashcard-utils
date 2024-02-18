import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'
import { join } from 'https://deno.land/std@0.216.0/path/mod.ts'

const app = new Hono()
const root = './examples/test'

// THIS IS UNNECESSARY FOR NORMAL USE. It is just for live reload of dev code
app.get('flashcards/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [main, _adapters] = await build()
  return c.body(main.text)
})

app.get('flashcards/adapters/mod.js', async (c) => {
  const { build } = await import('../../build.ts')
  c.header('Content-Type', 'application/javascript')
  const [_main, adapters] = await build()
  return c.body(adapters.text)
})

app.get('/', serveStatic({ path: join(root, './index.html') }))
app.use('/*', serveStatic({ root }))

Deno.serve(app.fetch)
