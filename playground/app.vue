<script setup lang="ts">
const version = useState('version', () => '0.0.0')

if (import.meta.server) {
  const { app } = useElectron()!
  version.value = app.getVersion()
}
</script>

<template>
  <div>
    Nuxt Playground

    <p>{{ version }}</p>
  </div>
</template>
