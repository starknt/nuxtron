<script setup lang="ts">
const { data, pending } = useFetch('/api/test')
const version = useState('version', () => '0.0.0')
const nitroVersion = ref('0.0.0')

if (import.meta.server) {
  const { app } = useElectron()
  version.value = app.getVersion()
}

if (import.meta.client) {
  $fetch('/api/ver')
    .then(ver => nitroVersion.value = ver)
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
  </div>
</template>
