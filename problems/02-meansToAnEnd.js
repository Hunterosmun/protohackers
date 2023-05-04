import { pipeline } from 'node:stream/promises'

export default function handler (socket) {
  const assets = []
  pipeline(
    socket,
    chunk(9),
    map(chunk => {
      const command = chunk.readUInt8()
      const firstFour = chunk.readInt32BE(1)
      const secondFour = chunk.readInt32BE(5)
      switch (String.fromCharCode(command)) {
        case 'I':
          // Here the first is the time and second is the price at that time
          assets.push({ time: firstFour, price: secondFour })
          break
        case 'Q':
          // Here first and second are times that you are looking for prices in
          const matches = assets.filter(
            entry => entry.time >= firstFour && entry.time <= secondFour
          )
          const response = Buffer.from([0, 0, 0, 0])
          if (!matches.length) return socket.write(response)
          response.writeInt32BE(
            Math.floor(
              matches.reduce((acc, e) => acc + e.price, 0) / matches.length
            )
          )
          return socket.write(response)

        default:
          throw new Error('PANIC! THERE IS NO DISCO!!')
      }
    })
  ).catch(err => console.error(err))
}

function chunk (num) {
  return async function* (source) {
    let buffer = Buffer.from([])
    for await (const chunk of source) {
      buffer = Buffer.concat([buffer, chunk])
      while (buffer.length >= num) {
        yield buffer.subarray(0, num)
        buffer = buffer.subarray(num)
      }
    }
  }
}

function map (mapper) {
  return async function* (source) {
    for await (const chunk of source) {
      yield mapper(chunk)
    }
  }
}