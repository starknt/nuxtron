const whitelist = [
  '/api/sse',
]

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    if (whitelist.some(path => event.path.includes(path)))
    // eslint-disable-next-line no-console
      console.log(`log-plugin: ${event.path}`)
  })
  nitro.hooks.hook('beforeResponse', (event, response) => {
    if (whitelist.some(path => event.path.includes(path)))
    // eslint-disable-next-line no-console
      console.log('log-plugin: ', response)
  })
})
