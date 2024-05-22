<script setup lang="ts">
const example1 = ref('')
const example2 = ref('Only work with the http2 server, no support')
const example3 = ref('')
const example4 = ref('0.0.0')
const example5 = useState('version', () => '0.0.0')

if (import.meta.server) {
  useIpcMain().handle('ipc', (_, s: string) => {
    return `echo: ${s}`
  })
  const { app } = useElectron()
  example5.value = app.getVersion()
}

if (import.meta.client) {
  const decoder = new TextDecoder()
  async function logProgress(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    return reader.read().then(({ value, done }) => {
      if (done) {
        if (value)
          example1.value += decoder.decode(value)
        return
      }
      if (value)
        example1.value += decoder.decode(value)

      return logProgress(reader)
    })
  }

  fetch('/api/stream')
    .then(res => res.body!.getReader())
    .then(logProgress)

  // @ts-expect-error ignore
  // eslint-disable-next-line no-console
  console.log(useIpcRenderer(), window.__NUXTRON__)
  useIpcRenderer()
    .invoke('ipc', 'hello')
    .then((s: string) => example3.value = s)

  $fetch('/api/ver')
    .then(ver => example4.value = ver)
}
</script>

<template>
  <div class="p4">
    <p>Example</p>
    <div class="mt-2 flex flex-col gap-2">
      <div>Example 1: Stream Response</div>
      <p v-html="example1" />

      <div>Example 2: Send Stream Body</div>
      <p>{{ example2 }}</p>

      <div>Example 3: Electron Ipc</div>
      <p>{{ example3 }}</p>

      <div>Example 4: Nitro Api </div>
      <p>{{ example4 }}</p>

      <div>Example 5: Nuxt Async Data (Electron Version)</div>
      <p>{{ example5 }}</p>
    </div>
  </div>
</template>
