// Real-time drawing API using Server-Sent Events
import { NextApiRequest, NextApiResponse } from 'next'

interface DrawData {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  userId: string
  timestamp: number
}

// In-memory storage for drawing events (resets on each deployment)
let drawingEvents: DrawData[] = []
let connectedClients: NextApiResponse[] = []
let drawingEnabled = true
let userCount = 0

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Setup Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    })

    userCount++
    connectedClients.push(res)
    
    // Send current state to new client
    res.write(`data: ${JSON.stringify({ 
      type: 'user-count', 
      count: userCount 
    })}\n\n`)
    
    res.write(`data: ${JSON.stringify({ 
      type: 'drawing-enabled', 
      enabled: drawingEnabled 
    })}\n\n`)

    // Send recent drawing events to new client
    const recentEvents = drawingEvents.slice(-50) // Last 50 events
    recentEvents.forEach(event => {
      res.write(`data: ${JSON.stringify({ 
        type: 'drawing', 
        data: event 
      })}\n\n`)
    })

    // Handle client disconnect
    req.on('close', () => {
      userCount--
      connectedClients = connectedClients.filter(client => client !== res)
      // Broadcast updated user count
      broadcast({ type: 'user-count', count: userCount })
    })

    return
  }

  if (req.method === 'POST') {
    const { action, data } = req.body

    switch (action) {
      case 'drawing':
        if (drawingEnabled && data) {
          const drawData: DrawData = {
            ...data,
            timestamp: Date.now()
          }
          
          // Store the drawing event
          drawingEvents.push(drawData)
          
          // Keep only last 1000 events to prevent memory issues
          if (drawingEvents.length > 1000) {
            drawingEvents = drawingEvents.slice(-1000)
          }

          // Broadcast to all connected clients
          broadcast({ type: 'drawing', data: drawData })
        }
        break

      case 'clear-canvas':
        drawingEvents = [] // Clear all stored events
        broadcast({ type: 'clear-canvas' })
        break

      case 'toggle-drawing':
        drawingEnabled = data.enabled
        broadcast({ type: 'drawing-enabled', enabled: drawingEnabled })
        break
    }

    res.status(200).json({ success: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

function broadcast(message: any) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  connectedClients.forEach(client => {
    try {
      client.write(data)
    } catch (error) {
      // Remove disconnected clients
      connectedClients = connectedClients.filter(c => c !== client)
    }
  })
}
