export default defineEventHandler((event) => {
  const eventStream = createEventStream(event)

  // Send a message every second
  let count = 0
  const interval = setInterval(async () => {
    await eventStream.push(`Hello world ${count++}`)
  }, 1000)

  // cleanup the interval and close the stream when the connection is terminated
  eventStream.onClosed(async () => {
    clearInterval(interval)
    await eventStream.close()
  })

  return eventStream.send()
})
