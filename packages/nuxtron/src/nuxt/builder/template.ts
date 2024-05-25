export function devTemplate(port: number) {
  return `
    import { useNitroApp } from 'nitropack/runtime/app'
    import { Server } from 'node:http'
    import { isWindows } from 'std-env'
    import { defineEventHandler, getQuery, getRouterParam, readBody, toNodeListener } from 'h3'
    import { runTask, startScheduleRunner } from 'nitropack/runtime/task'
    import { scheduledTasks, tasks } from '#internal/nitro/virtual/tasks'
    import electron from 'electron'
    import { setupNuxtron, handler as nuxtronHandler } from 'renuxtron/dev'

    await setupNuxtron()
    const nitroApp = useNitroApp()
    const server = new Server((req, res) => {
      if(req.url.startsWith('/_nuxtron')) {
        return nuxtronHandler(req, res, nitroApp)
      }

      return toNodeListener(nitroApp.h3App)(req, res)
    })

    server.listen(${port}, () => {
      const _address = server.address()
      process.send?.({
        event: 'address',
        address:
          typeof _address === 'string'
            ? { socketPath: _address }
            : { host: 'localhost', port: _address?.port },
      })
    })

    // Register tasks handlers
    nitroApp.router.get(
      '/_nitro/tasks',
      defineEventHandler(async () => {
        const _tasks = await Promise.all(
          Object.entries(tasks).map(async ([name, task]) => {
            const _task = await task.resolve?.()
            return [name, { description: _task?.meta?.description }]
          }),
        )
        return {
          tasks: Object.fromEntries(_tasks),
          scheduledTasks,
        }
      }),
    )
    nitroApp.router.use(
      '/_nitro/tasks/:name',
      defineEventHandler(async (event) => {
        const name = getRouterParam(event, 'name')
        const payload = {
          ...getQuery(event),
          ...(await readBody(event)
            .then(r => r?.payload)
            .catch(() => ({}))),
        }
        return await runTask(name, { payload })
      }),
    )

    // Scheduled tasks
    if (import.meta._tasks)
      startScheduleRunner()

    process.on('message', async (msg) => {
      const { event } = msg

      switch (event) {
        case 'shutdown': {
          // Graceful shutdown
          await nitroApp.hooks.callHook('close')
          process.exit(0)
        }
      }
    })
  `
}

export function buildTemplate() {
  return `
    import '#internal/nitro/virtual/polyfill'
    import nuxtronServerOptions from '#internal/nuxtron/server-options'
    import { toNodeListener } from 'h3'
    import { nitroApp } from 'nitropack/runtime/app'
    import { trapUnhandledNodeErrors } from 'nitropack/runtime/utils'
    import { startScheduleRunner } from 'nitropack/runtime/task'
    import { setupNuxtron } from 'renuxtron'

    const listener = toNodeListener(nitroApp.h3App)

    await setupNuxtron(listener, nuxtronServerOptions)

    // Trap unhandled errors
    trapUnhandledNodeErrors()

    // Scheduled tasks
    if (import.meta._tasks)
      startScheduleRunner()
  `
}
