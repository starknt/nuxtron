import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', format: 'esm' },
  ],
  declaration: true,
})
