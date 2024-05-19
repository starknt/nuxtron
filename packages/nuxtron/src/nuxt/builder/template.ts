export const devTemplate = `
import { useNitroApp } from 'nitropack/runtime/app'
import { Server } from 'node:http'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdirSync } from 'node:fs'
import { isWindows, provider } from 'std-env'
import {
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
  toNodeListener,
} from 'h3'
import { runTask, startScheduleRunner } from 'nitropack/runtime/task'
// @ts-expect-error virtual file
import { scheduledTasks, tasks } from '#internal/nitro/virtual/tasks'

const pid = process.env.E_PID
const threadId = process.env.E_THREAD_ID

const nitroApp = useNitroApp()
const server = new Server(toNodeListener(nitroApp.h3App))

function getAddress() {
  if (
    provider === 'stackblitz'
    || process.env.NITRO_NO_UNIX_SOCKET
    || process.versions.bun
  )
    return 0

  const socketName = "worker-" + pid + "-" + threadId + ".sock"
  if (isWindows) {
    return join('\\\\.\\pipe\\nitro', socketName)
  }
  else {
    const socketDir = join(tmpdir(), 'nitro')
    mkdirSync(socketDir, { recursive: true })
    return join(socketDir, socketName)
  }
}

const listenAddress = getAddress()
server.listen(listenAddress, () => {
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

export const buildTemplate = `
 // TODO: build template
`
