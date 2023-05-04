import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'

console.log('foo')
// is actually a shortcut for:
process.stdout.write('foo\n')
// process.stdout is a output stream and calling write on it will write stuff to it.
// There are a lot of other things you can do with it, basically you can write over stuff as you go
// Also, you can pass process.stdout to stream as an output stream to have it write to the terminal

// this is everything you input for calling this code
console.log(process.argv)

// This will give you the headers
const res = await fetch('https://www.iwastesomuchtime.com')
// And this is how you get the body off of it in a readable format
const body = await res.text()

// STREAMS!
const file = 'package.json'
const firstStream = fs.createReadStream(file)
firstStream.on('data', chunk => {
  process.stdout.write(chunk)
})
// Above and below will do the same thing
const secondStream = fs.createReadStream(file).pipe(process.stdout)

// This uses stdin, which is an input stream. This uses what is input into the terminal
process.stdin.on('data', chunk => {
  console.log(chunk)
})

/*
process.stdin and process.argv are two different things. argv is what's after you call the command, while stdin is what's input after the command is called
  IE: argv is like this
  > node stream.js OH LOOK! AN ARGV

  While stdin is like this
  > node stream.js
  I typed into the blinking terminal and it's going into stdin!

Note: argv's first 2 arguments are paths (first is the path to node, the second is the path to where you are now)
*/

// async generator
async function* getAllUsers (args) {
  const skip = args || 0
  while (true) {
    const res = await fetch(`/api/v1/users?skip=${skip}&limit=25`)
    const users = await res.json()
    for (const user of users) yield user
    if (!users.length) return
    skip += users.length
  }
}

for await (const user of getAllUsers()) {
  console.log(user)
  // HERE!! Here you get your users in batches of 25, so even if you have millions of users, you won't run out of memory looking at all of em
}

// Streams
// Readable streams can be piped to writeable streams
fs.createReadStream(process.argv[2]).pipe(process.stdout)
// There are also transform streams that you can make
// But managing a bunch of pipes in a row can be a hassle, SO:

// First thing is a read stream (on our first arg highWaterMark just says it's going to read 10 characters at a time)
// Last thing is a writeable stream
// Everything inbetween is the transform stream/functions ("Pipeline tranform"'s)
const __filename = new URL(import.meta.url).pathname

function split (char) {
  const code = char.charCodeAt(0)
  return async function* (source) {
    // This function will take it from being 10 character lines to full lines of code
    // BTW, this is currently useless, as we are the ones making it 10 earlier on XD
    let buffer = Buffer.from([])
    for await (const chunk of source) {
      buffer = Buffer.concat([buffer, chunk])
      // buffer.indexOf(10) is saying take the index of the newline character
      for (let i = buffer.indexOf(10); i !== -1; i = buffer.indexOf(10)) {
        yield buffer.subarray(0, i)
        buffer = buffer.subarray(i + 1)
      }
    }
  }
}

function filter (predicate) {
  return async function* (source) {
    for await (const chunk of source) {
      if (predicate(chunk)) yield chunk
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

pipeline(
  fs.createReadStream(__filename, { highWaterMark: 10 }),
  split('\n'),
  map(line => line.toString()),
  filter(line => line.includes('for await')),
  map(line => line.toUpperCase()),
  async function* (source) {
    // This *could* be done with the map function now, but I'm leaving it here so you remember you can put generators straight into pipeline
    for await (const chunk of source) {
      console.log(chunk.toString())
      // yield chunk.toString().toUpperCase()
    }
  },
  process.stdout
)
