import type { ServerOptions } from '../../types'

export function devTemplate(port: number) {
  return `
    import { useNitroApp } from 'nitropack/runtime/app'
    import { Server } from 'node:http'
    import { isWindows } from 'std-env'
    import { defineEventHandler, getQuery, getRouterParam, readBody, toNodeListener } from 'h3'
    import { runTask, startScheduleRunner } from 'nitropack/runtime/task'
    import { scheduledTasks, tasks } from '#internal/nitro/virtual/tasks'
    import electron from 'electron'

    const pid = process.env.E_PID
    const threadId = process.env.E_THREAD_ID

    const nitroApp = useNitroApp()
    const server = new Server((req, res) => {
      if(req.url.startsWith('/_nuxtron')) {
        let action = req.url.slice('/_nuxtron'.length)
        if(action.startsWith('/')) {
          action = action.slice(1)
        }

        try {
          switch(action) {
            case 'page:reload':
              electron.BrowserWindow.getAllWindows().forEach(w => w.reload())
              break
          }

          return res.end('ok:with:' + action)
        } catch(error) {
          return res.end('fail:with:' + action)
        }
      }

      return toNodeListener(nitroApp.h3App)(req, res)
    })

    server.listen('${port}', () => {
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

export interface BuildTemplateOptions {
  handler_path: string
  serverOptions?: ServerOptions
}

export function buildTemplate(options: BuildTemplateOptions) {
  return `
    import { createServer as $_internal_nuxtron_createServer } from 'renuxtron'
    import { handler as $_internal_handler } from '${options.handler_path}'

    await $_internal_nuxtron_createServer($_internal_handler, ${JSON.stringify(options.serverOptions)})
  `
}
