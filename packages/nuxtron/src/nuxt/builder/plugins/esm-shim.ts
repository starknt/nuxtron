import type { Plugin } from 'rollup'
import MagicString from 'magic-string'

const CJSyntaxRe = /__filename|__dirname|require\(|require\.resolve\(/

const CJSShim = `
// -- CommonJS Shims --
import __cjs_url__ from 'node:url';
import __cjs_path__ from 'node:path';
import __cjs_mod__ from 'node:module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
`

const ESMStaticImportRe
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  = /(?<=\s|^|;)import\s*([\s"']*(?<imports>[\p{L}\p{M}\w\t\n\r $*,/{}@.]+)from\s*)?["']\s*(?<specifier>(?<=")[^"]*[^\s"](?=\s*")|(?<=')[^']*[^\s'](?=\s*'))\s*["'][\s;]*/gmu

interface StaticImport {
  end: number
}

function findStaticImports(code: string): StaticImport[] {
  const matches: StaticImport[] = []
  for (const match of code.matchAll(ESMStaticImportRe))
    matches.push({ end: (match.index || 0) + match[0].length })

  return matches
}

export function esmShim(): Plugin {
  return {
    name: 'nuxtron:esm-shim',
    renderChunk(code: string, chunk: any, options) {
      if (options.format === 'es' && chunk.isEntry) {
        if (code.includes(CJSShim) || !CJSyntaxRe.test(code))
          return null

        const lastESMImport = findStaticImports(code).pop()
        const indexToAppend = lastESMImport ? lastESMImport.end : 0
        const s = new MagicString(code)
        s.appendRight(indexToAppend, CJSShim)
        return {
          code: s.toString(),
          map: options.sourcemap ? s.generateMap({ hires: 'boundary' }) : null,
        }
      }

      return null
    },
  }
}
