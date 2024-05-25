<script setup lang="ts">

</script>

<template>
  <div class="p4 pt-2">
    <div class="flex justify-center">
      <Logo />
    </div>

    <div>
      <NuxtLink to="/prerender">
        Prerender
      </NuxtLink>
      <NuxtLink to="/">
        Index
      </NuxtLink>
    </div>

    <NuxtPage />
  </div>
</template>
