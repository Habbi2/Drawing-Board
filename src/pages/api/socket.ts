import { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'

interface SocketServer extends HTTPServer {
  io?: Server | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

interface DrawData {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  userId: string
}

let userCount = 0
let drawingEnabled = true

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = new Server(res.socket.server, {
    path: '/api/socket.io/',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })
  res.socket.server.io = io

  io.on('connection', (socket) => {
    userCount++
    console.log(`User connected. Total users: ${userCount}`)
    
    // Send current state to new user
    socket.emit('drawing-enabled', drawingEnabled)
    io.emit('user-count', userCount)

    // Handle drawing events
    socket.on('drawing', (data: DrawData) => {
      console.log('Drawing data received:', data)
      if (drawingEnabled) {
        // Broadcast to all other clients
        socket.broadcast.emit('drawing', data)
      }
    })

    // Handle moderator actions
    socket.on('clear-canvas', () => {
      console.log('Clear canvas requested')
      io.emit('clear-canvas')
    })

    socket.on('toggle-drawing', (enabled: boolean) => {
      console.log('Toggle drawing requested:', enabled)
      drawingEnabled = enabled
      io.emit('drawing-enabled', enabled)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      userCount--
      console.log(`User disconnected. Total users: ${userCount}`)
      io.emit('user-count', userCount)
    })
  })

  res.end()
}

export default SocketHandler
