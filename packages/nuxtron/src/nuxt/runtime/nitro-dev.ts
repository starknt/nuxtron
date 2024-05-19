import '#internal/nitro/virtual/polyfill'
import { join } from 'node:path'
import { parentPort, threadId } from 'node:worker_threads'
import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { kill } from 'node:process'
import electron from 'electron'
import consola from 'consola'

let ps: ChildProcess
const logger = consola.create({}).withTag('nuxtron')

async function onReady() {
  // TODO: dev entry file path from builder
  const filepath = join(process.cwd(), '.nuxt', 'dev', 'dev.mjs')
  while (true) {
    if (fs.existsSync(filepath))
      break
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // check pid
  if (fs.existsSync(join(tmpdir(), 'nuxtron-dev.pid'))) {
    const pid = Number(fs.readFileSync(join(tmpdir(), 'nuxtron-dev.pid'), 'utf-8'))
    if (pid && !Number.isNaN(pid)) {
      try {
        kill(pid)
      }
      catch (error) {

      }
    }
  }

  ps = spawn(electron as any, [filepath], {
    stdio: [null, 'pipe', null, 'ipc'],
    env: {
      ...process.env,
      E_PID: process.pid.toString(),
      E_THREAD_ID: threadId.toString(),
    },
  })

  // record current pid
  fs.writeFileSync(join(tmpdir(), 'nuxtron-dev.pid'), (ps.pid ? String(ps.pid) : ''))

  ps.stdout?.on('data', (data) => {
    // TODO: better console log
    // eslint-disable-next-line node/prefer-global/buffer
    logger.log(Buffer.from(data).toString('utf-8'))
  })

  ps.on('message', (msg) => {
    if (msg) {
      const { event, ...args } = msg as any
      if (event === 'address') {
        parentPort?.postMessage({
          event: 'listen',
          address: args.address,
        })
      }
    }
  })

  ps.once('exit', () => {
    parentPort?.postMessage({ event: 'exit' })
  })
}

function onShutdown() {
  return new Promise<void>((resolve, reject) => {
    ps.send({ event: 'shutdown' }, (err) => {
      if (err)
        reject(err)

      resolve()
    })
  })
}

onReady()

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown') {
    await onShutdown()
    parentPort?.postMessage({ event: 'exit' })
  }
})
