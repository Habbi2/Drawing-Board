// Real-time drawing API with better Vercel compatibility
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
  id: string
}

interface DrawingState {
  events: DrawData[]
  lastEventId: number
  drawingEnabled: boolean
  connectedUsers: Set<string>
}

// Global state - in production, you'd use Redis or another persistent store
let globalState: DrawingState = {
  events: [],
  lastEventId: 0,
  drawingEnabled: true,
  connectedUsers: new Set()
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    const { since } = req.query
    const sinceId = since ? parseInt(since as string) : 0
    
    // Return events since the specified ID
    const newEvents = globalState.events.filter(event => 
      parseInt(event.id) > sinceId
    )

    res.status(200).json({
      events: newEvents,
      lastEventId: globalState.lastEventId,
      drawingEnabled: globalState.drawingEnabled,
      userCount: globalState.connectedUsers.size
    })
    return
  }

  if (req.method === 'POST') {
    const { action, data, userId } = req.body

    // Track user connection
    if (userId) {
      globalState.connectedUsers.add(userId)
    }

    switch (action) {
      case 'drawing':
        if (globalState.drawingEnabled && data) {
          globalState.lastEventId++
          const drawData: DrawData = {
            ...data,
            timestamp: Date.now(),
            id: globalState.lastEventId.toString()
          }
          
          globalState.events.push(drawData)
          
          // Keep only last 500 events to prevent memory issues
          if (globalState.events.length > 500) {
            globalState.events = globalState.events.slice(-500)
          }
        }
        break

      case 'clear-canvas':
        globalState.lastEventId++
        globalState.events.push({
          x: 0, y: 0, prevX: 0, prevY: 0,
          color: '', lineWidth: 0, userId: '',
          timestamp: Date.now(),
          id: globalState.lastEventId.toString()
        })
        // Also clear the actual drawing events
        globalState.events = globalState.events.filter(e => e.color === '')
        break

      case 'toggle-drawing':
        globalState.drawingEnabled = data.enabled
        break

      case 'heartbeat':
        // Keep user connection alive
        if (userId) {
          globalState.connectedUsers.add(userId)
        }
        break
    }

    res.status(200).json({ 
      success: true,
      lastEventId: globalState.lastEventId,
      userCount: globalState.connectedUsers.size
    })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

// Clean up old user connections periodically
setInterval(() => {
  // In a real implementation, you'd track user activity timestamps
  // For now, we'll just keep the set as is
}, 30000)
