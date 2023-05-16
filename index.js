// import { Server } from 'node:net'
// import handler from './problems/01-primeTime.js'
// import handler from './problems/02-meansToAnEnd.js'
// import handler from './problems/03-budgetChat.js'
// import start from './problems/04-unusualDatabaseProblem.js'
import start from './problems/05-mobInTheMiddle.js'

/*
  Problems we're solving are on: https://protohackers.com/problems
  IP: 2a09:8280:1::15:490
  Port: 1024 (Now 8080?)
*/

const { PORT = '3000' } = process.env
const port = Number.parseInt(PORT, 10)

// this was used for problems 1-3
// const server = new Server(handler)

// server.listen(port).on('listening', () => {
//   console.log(`TCP server listening on port ${port}`)
// })

// This was for problem 4 and on
await start(port)
console.log(`server listening on port ${port}`)
process.once('SIGINT', () => process.exit())
