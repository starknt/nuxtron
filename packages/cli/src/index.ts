import { defineCommand, runMain } from 'citty'
import nuxiPkg from '../package.json' assert { type: 'json' }

const main = defineCommand({
  meta: {
    name: nuxiPkg.name,
    version: nuxiPkg.version,
    description: nuxiPkg.description,
  },
})

runMain(main)
