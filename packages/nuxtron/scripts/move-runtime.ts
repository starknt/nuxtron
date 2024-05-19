import fs from 'node:fs'
import { dirname, format, join, parse } from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const srcRuntime = join(cwd, './src/nuxt/runtime')

function walkDir(dir: string): string[] {
  const ret: string[] = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory())
      ret.push(...walkDir(fullPath))
    else
      ret.push(fullPath)
  }
  return ret
}

walkDir(srcRuntime)
  .forEach((file) => {
    const filename = file.replace(join(cwd, 'src/nuxt'), '')
    const path = parse(filename)
    path.ext = '.mjs'
    if (!fs.existsSync(join(cwd, 'dist/nuxt', format(path)))) {
      fs.mkdirSync(join(cwd, 'dist/nuxt', dirname(filename)), { recursive: true })
      fs.copyFileSync(file, join(cwd, 'dist/nuxt', format(path)))
    }
  })
