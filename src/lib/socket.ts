import { Server } from 'socket.io'
import { createServer } from 'http'

let io: Server

export function initSocket(server: any) {
  if (!io) {
    io = new Server(server, {
      path: '/api/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    let userCount = 0
    let drawingEnabled = true

    io.on('connection', (socket) => {
      userCount++
      console.log(`User connected. Total users: ${userCount}`)
      
      // Send current state to new user
      socket.emit('drawing-enabled', drawingEnabled)
      io.emit('user-count', userCount)

      // Handle drawing events
      socket.on('drawing', (data) => {
        if (drawingEnabled) {
          socket.broadcast.emit('drawing', data)
        }
      })

      // Handle moderator actions
      socket.on('clear-canvas', () => {
        io.emit('clear-canvas')
      })

      socket.on('toggle-drawing', (enabled: boolean) => {
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
  }
  return io
}

export { io }
