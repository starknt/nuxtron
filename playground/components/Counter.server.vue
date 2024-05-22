<script setup lang="ts">
defineProps<{
  counter: number
}>()
</script>

<template>
  <div>
    <p>Counter: {{ counter }}</p>
    <slot />
  </div>
</template>
