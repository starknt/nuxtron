export default defineEventHandler(async () => {
  const data = await $fetch('/api/hello')

  return data
})
