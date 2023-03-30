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
  console.log('connected to ', socket.address())
  socket.pipe(socket)
  socket.on('error', error => console.log(error))
})

server.listen(port).on('listening', () => {
  console.log(`TCP server listening on port ${port}`)
})
