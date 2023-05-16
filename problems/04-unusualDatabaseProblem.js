import dgram from 'node:dgram'
import { once } from 'node:events'

const store = new Map([['version', 'Caseyinator store-inator 4.867.2']])
const HOST = process.env.UDP_HOST

// Other thing you need for this to work is a constant IP pointing to a static site or some such nonsense. It's a fly.io thing that costs $$

export default async function start (port) {
  const server = dgram.createSocket('udp4')
  server.on('error', err => console.error(err))
  server.on('message', (message, rinfo) => {
    const string = message.toString('utf-8')
    if (string.includes('=')) {
      // insert
      const [key, ...valueParts] = string.split('=')
      if (key === 'version') return
      store.set(key, valueParts.join('='))
      return
    }
    // retrieve
    const value = store.get(string) ?? ''
    server.send([string, value].join('='), rinfo.port, rinfo.address)
  })

  const listening = once(server, 'listening')
  server.bind(port, HOST)
  await listening
}
