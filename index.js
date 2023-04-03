import { Server } from 'node:net'

// Problems we're solving are on: https://protohackers.com/problems

/*
Steps:
  1: yarn start:server
  2: yarn start:ngrok
  3: take the forwarding on that (ie: tcp://2.tcp.ngrok.io:19125)
  4: nslookup <address> (take address) (ie: nslookup 2.tcp.ngrok.io) (expected: 3.131.207.170)
  5: Input stuff into the website
    The IP address is what you got from step 4
    The port number is what's on the end of step 3


  JK we're trying fly? cause ngrok is bad at routing sockets?

  JK that's paid for a good IP or something?

  JK Keith is paying and we're smiling alongside?

  JK Maybe not...?

  K, so it's on fly,
  IP is 2a09:8280:1::15:490
  Port is 1024
*/

const { PORT = '3000' } = process.env
const port = Number.parseInt(PORT, 10)

const server = new Server(socket => {
  let buffer = Buffer.from([])
  socket.on('data', data => {
    buffer = Buffer.concat([buffer, data])
    try {
      let str = buffer.toString('utf-8')
      while (str.includes('\n')) {
        // split out the stuff and things
        const [current, ...other] = str.split('\n')
        checkIndividual(current, socket)
        const fullStr = other.join('\n')
        buffer = Buffer.from(fullStr)
        str = fullStr
      }
    } catch (err) {
      console.log('CCAAPPPTTAAAIIINNN!!! TELL CASSEY WE HAVE AN ERROÖR!!!', err)
      // socket.write('CAPTAIN!! WE HAVE AN ERROR!!')
      socket.write('malformed\n')
    }
  })
  socket.on('error', error => console.log('Oopsie whoopsie', error))
})

server.listen(port).on('listening', () => {
  console.log(`TCP server listening on port ${port}`)
})

function checkIndividual (str, socket) {
  console.log('str is: ', str)
  let json
  try {
    json = JSON.parse(str)
  } catch (err) {
    console.log('CÄptain, we have reached errorton', err)
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

/*

{"method":"isPrime","number":1}
{"method":"isPrime","number":2}  {"method":"isPrime","number":3}
{"method":"isPrime","number":4}
{"method":"isPrime","number":5}

*/
