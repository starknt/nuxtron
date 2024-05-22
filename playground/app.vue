<script setup lang="ts">
const { data, pending } = useFetch('/api/test')
const version = useState('version', () => '0.0.0')
const nitroVersion = ref('0.0.0')
const example1 = ref('')
const example2 = ref('Only work with the http2 server, no support')

if (import.meta.server) {
  const { app } = useElectron()
  version.value = app.getVersion()
}

if (import.meta.client) {
  $fetch('/api/ver')
    .then(ver => nitroVersion.value = ver)

  const decoder = new TextDecoder()
  function logProgress(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
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
}
</script>

<template>
  <div>
    Nuxt Playground

    <div class="flex flex-col gap-2">
      <div class="flex gap-1">
        <p>
          Nitro Api version:
        </p>
        <p>
          {{ nitroVersion }}
        </p>
      </div>

      <p v-if="pending">
        Loading...
      </p>
      <p v-else>
        {{ data }}
      </p>
    </div>

    <div class="flex gap-2">
      <p>Electron Version: </p>
      <p>{{ version }}</p>
    </div>

    <p>Stream Example</p>
    <div class="mt-2 flex flex-col gap-2">
      <div>Example 1: Stream Response</div>
      <div v-html="example1" />

      <div>Example 2: Send Stream Body</div>
      <div>
        <p>{{ example2 }}</p>
      </div>
    </div>
  </div>
</template>
