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
    { out: './mod', in: './mod.ts' },
    { out: 'adapters/mod', in: 'adapters/mod.ts' },
  ],
  format: 'esm',
  outdir: './',
  plugins: [...denoPlugins()],
  treeShaking: true,
}

await esbuild.build(options)
esbuild.stop()

export default async function build() {
  const result = await esbuild.build({ ...options, write: false })
  await esbuild.stop()
  return result.outputFiles
}
