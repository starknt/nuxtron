export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (request) => {
    // eslint-disable-next-line no-console
    console.log(`log-plugin: ${request.path}`)
  })
})
