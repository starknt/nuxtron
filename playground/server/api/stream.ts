import { Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/html')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Transfer-Encoding', 'chunked')

  let interval: NodeJS.Timeout
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('<ul>')

      interval = setInterval(() => {
        controller.enqueue(`<li>${Math.random()}</li>`)
      }, 1000)

      setTimeout(() => {
        clearInterval(interval)
        controller.close()
      }, 1000 * 10)
    },
    cancel() {
      clearInterval(interval)
    },
  })

  return sendStream(event, Readable.fromWeb(stream))
})
