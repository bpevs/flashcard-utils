/**
 * Build script to transpile this code for browser.
 *
 * Builds 2 packages:
 *   1. `mod.js` contains everything EXCEPT adapters.
 *   2. `adapters/mod.js` contains adapters, since they have more dependencies
 */
import type { Format } from 'npm:esbuild'
import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@0.9.0'
import { resolve } from 'jsr:@std/path@0.215.0'

const importMapURL = 'file://' + resolve('./import_map.json')
const options = {
  bundle: true,
  entryPoints: [
    { out: 'core/mod', in: './core/mod.ts' },
    { out: 'adapters/mod', in: './adapters/mod.ts' },
    { out: 'components/mod', in: './components/mod.ts' },
    { out: 'schedulers/mod', in: './schedulers/mod.ts' },
    { out: 'utils/mod', in: './utils/mod.ts' },
  ],
  format: 'esm' as Format,
  outdir: './',
  plugins: [...denoPlugins({ importMapURL })],
  treeShaking: true,
}

await esbuild.build(options)
esbuild.stop()

// deno-lint-ignore no-explicit-any
export const build = debounce<any>(async function () {
  const result = await esbuild.build({
    ...options,
    write: false,
  })
  await esbuild.stop()
  return result.outputFiles
}, 100)

function debounce<R>(
  // deno-lint-ignore no-explicit-any
  func: (...args: any[]) => any,
  wait: number,
): () => Promise<R> {
  // deno-lint-ignore no-explicit-any
  const resolves: any[] = []
  let timer: number

  // deno-lint-ignore no-explicit-any
  return function debounced(...args: any[]): Promise<R> {
    return new Promise((resolve) => {
      resolves.push(resolve)
      const later = () => {
        globalThis.clearTimeout(timer)
        const result = func.apply(this, args)
        while (resolves.length) {
          resolves.shift()(result)
        }
      }

      globalThis.clearTimeout(timer)
      timer = globalThis.setTimeout(later, wait)
    })
  }
}
