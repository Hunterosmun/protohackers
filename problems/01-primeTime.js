import { pipeline } from 'node:stream/promises'
import { map, split } from './utils.js'

export default function handler (socket) {
  const assets = []
  pipeline(
    socket,
    split(10),
    map(chunk => {
      let json
      try {
        json = JSON.parse(chunk)
      } catch (err) {
        throw new Error('malformed broski')
      }

      // then check to see if it's an object with the correct properties
      const num = json?.number
      if (
        json?.method !== 'isPrime' ||
        typeof num !== 'number' ||
        !isPlainObject(json)
      ) {
        console.log({ method: json?.method, num, isPlain: isPlainObject(json) })
        throw new Error('malformed')
      }

      // lastly, check if the number is prime
      const resp = { method: 'isPrime', prime: isPrime(num) }
      socket.write(JSON.stringify(resp) + '\n')
    })
  ).catch(_ => socket.write('malformed\n'))
}

function isPlainObject (value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isPrime (value) {
  // 1 or negative numbers cannot be prime
  if (value < 2) return false
  if (!Number.isInteger(value)) return false
  const smallestDivis = Math.floor(Math.sqrt(value))
  for (let i = 2; i <= smallestDivis; i++) {
    if (Number.isInteger(value / i)) return false
  }
  return true
}
