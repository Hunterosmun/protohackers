import { pipeline } from 'node:stream/promises'

const NAME_REGEX = /^[a-zA-Z0-9]{1,16}$/

const moziers = new Map()

const INVALID_NAME =
  "*PROBLEM Y'ALL* Yer fixin to be called by scoogly eldrich tarnations™! Cain't have that!"
const DUPLICATE_NAME =
  "*PROBLEM Y'ALL* Yer fixin to be called by another mozy-er's name! Cain't have that!"
const ENTRY_MESSAGE =
  "Oh howdy there stranger! We're fixin to holler at ya, what should we hollerin??\n"

export default function handler (socket) {
  let name = null
  socket.write(ENTRY_MESSAGE)
  pipeline(
    socket,
    split('\n'),
    map(message => {
      const line = message.toString()
      // First, if the user already exists, send out the message as normal
      if (name) return broadcast(socket, `[${name}] ${message}\n`)
      // BUT if they don't exist, we need to do some checks to see if they gave a good username
      if (moziers.has(line)) {
        socket.write(DUPLICATE_NAME)
        return socket.end()
      }
      if (!NAME_REGEX.test(line)) {
        socket.write(INVALID_NAME)
        return socket.end()
      }
      name = line
      socket.write(
        `* Howdy howdy! Fer yer knowin, the other mozy-er's at this here hootinany go by: ${Array.from(
          moziers.keys()
        ).join(', ')}\n`
      )
      moziers.set(name, socket)
      broadcast(socket, `* Howdy y'all! ${name} just mozy'd on in!\n`)
    })
  )
    .catch(err => console.error(err))
    .finally(() => {
      if (name) {
        moziers.delete(name)
        broadcast(socket, `* Y'all gotta bid ${name} farewell :(\n`)
      }
    })
}

function map (mapper) {
  return async function* (source) {
    for await (const chunk of source) {
      yield mapper(chunk)
    }
  }
}

function split (char) {
  const code = char.charCodeAt(0)
  return async function* (source) {
    let buffer = Buffer.from([])
    for await (const chunk of source) {
      buffer = Buffer.concat([buffer, chunk])
      // buffer.indexOf(10) is saying take the index of the newline character
      for (let i = buffer.indexOf(code); i !== -1; i = buffer.indexOf(code)) {
        yield buffer.subarray(0, i)
        buffer = buffer.subarray(i + 1)
      }
    }
  }
}

function broadcast (from, message) {
  for (const cowfolk of moziers.values()) {
    if (cowfolk === from) continue
    cowfolk.write(message)
  }
}
