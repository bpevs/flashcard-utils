/**
 * Build script to transpile this code for browser.
 *
 * Builds 2 packages:
 *   1. `mod.js` contains everything EXCEPT adapters.
 *   2. `adapters/mod.js` contains adapters, since they have more dependencies
 */
import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts'

const options = {
  bundle: true,
  entryPoints: [
    { out: 'core/mod', in: './core/mod.ts' },
    { out: 'adapters/mod', in: './adapters/mod.ts' },
    { out: 'components/mod', in: './components/mod.ts' },
    { out: 'schedulers/mod', in: './schedulers/mod.ts' },
    { out: 'utils/mod', in: './utils/mod.ts' },
  ],
  format: 'esm',
  outdir: './',
  plugins: [...denoPlugins()],
  treeShaking: true,
}

await esbuild.build(options)
esbuild.stop()

export const build = debounce(async function () {
  const result = await esbuild.build({
    ...options,
    write: false,
  })
  await esbuild.stop()
  return result.outputFiles
}, 100)

// deno-lint-ignore no-explicit-any
function debounce(func: (...args: any[]) => any, wait: number) {
  // deno-lint-ignore no-explicit-any
  const resolves: any[] = []
  let timer: number

  // deno-lint-ignore no-explicit-any
  return function debounced(...args: any[]) {
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
