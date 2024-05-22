import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const workDirname = dirname(fileURLToPath(import.meta.url))
export const workFilename = fileURLToPath(import.meta.url)
