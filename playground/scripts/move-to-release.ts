import { join } from 'node:path'
import fse from 'fs-extra'

const cwd = process.cwd()
const server = join(cwd, '.output/server')
const release = join(cwd, 'release/app/dist')

async function main() {
  await fse.copy(server, release)
}

main()
