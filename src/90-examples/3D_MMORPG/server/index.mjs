import * as http from 'http'
import { Server } from 'socket.io'

import { WorldServer } from './src/world-server.mjs'

const port = 3000
const server = http.createServer()
const options = {
  cors: { origin: '*' }
}
const io = new Server(server, options)

server.listen(port, () => {
  console.log('listening on:', port)
})

const WORLD = new WorldServer(io)
WORLD.Run()
