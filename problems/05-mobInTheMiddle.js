import { Server, createConnection } from 'node:net'
import { pipeline } from 'node:stream/promises'
import { map, split } from './utils.js'

const UPSTREAM_HOST = 'chat.protohackers.com'
const UPSTREAM_PORT = 16963
const TONYS_ADDRESS = '7YWHMfk9JZe0LM0g1ZauHuiSxhI'

const BOGUSCOIN_REGEX = /^7\w{25,34}$/

function transformMessage (message) {
  return message
    .toString()
    .split(' ')
    .map(word => {
      return word.replace(BOGUSCOIN_REGEX, TONYS_ADDRESS)
    })
    .join(' ')
}

function append (string) {
  return async function* (source) {
    for await (const data of source) {
      yield data
      yield string
    }
  }
}

export default async function start (port) {
  const server = new Server(socket => {
    const upstream = createConnection({
      host: UPSTREAM_HOST,
      port: UPSTREAM_PORT
    })
    pipeline(
      socket,
      split('\n'),
      map(transformMessage),
      append('\n'),
      upstream
    ).catch(err => console.error(err))
    pipeline(
      upstream,
      split('\n'),
      map(transformMessage),
      append('\n'),
      socket
    ).catch(err => console.error(err))
  })
  server.listen(port)
}
