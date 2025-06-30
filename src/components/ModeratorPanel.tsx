'use client'

import { useState, useEffect } from 'react'

export default function ModeratorPanel() {
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(true)
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Simple password - in production, use environment variables or proper auth
  const MODERATOR_PASSWORD = process.env.NEXT_PUBLIC_MODERATOR_PASSWORD || 'stream123'

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated) return

    const eventSource = new EventSource('/api/realtime')
    
    eventSource.onopen = () => {
      console.log('Moderator SSE connection opened')
      setIsConnected(true)
    }

    eventSource.onerror = (error) => {
      console.error('Moderator SSE connection error:', error)
      setIsConnected(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'user-count':
            setActiveUsers(message.count)
            break
          case 'drawing-enabled':
            setIsDrawingEnabled(message.enabled)
            break
        }
      } catch (error) {
        console.error('Failed to parse moderator SSE message:', error)
      }
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [isAuthenticated])

  const sendModeratorAction = async (action: string, data?: any) => {
    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data
        })
      })
    } catch (error) {
      console.error('Failed to send moderator action:', error)
    }
  }

  const clearCanvas = () => {
    sendModeratorAction('clear-canvas')
  }

  const toggleDrawing = () => {
    const newState = !isDrawingEnabled
    setIsDrawingEnabled(newState)
    sendModeratorAction('toggle-drawing', { enabled: newState })
  }

  const saveCanvas = () => {
    // Create a link to download the canvas as an image
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `drawing-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === MODERATOR_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border min-w-64">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Moderator Login</h2>
            <p className="text-sm text-gray-600">Enter password to access moderator controls</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter moderator password"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            >
              Login
            </button>
          </form>

          <div className="border-t pt-3">
            <div className="text-xs text-gray-600">
              <strong>Default password:</strong> {process.env.NEXT_PUBLIC_MODERATOR_PASSWORD ? '[Environment Variable]' : 'stream123'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {!process.env.NEXT_PUBLIC_MODERATOR_PASSWORD && 'Change this in production!'}
              {process.env.NEXT_PUBLIC_MODERATOR_PASSWORD && 'Using custom password from environment'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border min-w-64">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Moderator Panel</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Active viewers: <span className="font-semibold">{activeUsers}</span></div>
            <div className={`text-xs font-semibold ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={clearCanvas}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
          >
            Clear Canvas
          </button>

          <button
            onClick={toggleDrawing}
            className={`w-full px-4 py-2 rounded font-medium transition-colors ${
              isDrawingEnabled
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isDrawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
          </button>

          <button
            onClick={saveCanvas}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
          >
            Save Canvas
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
          <div className="space-y-1 text-xs">
            <div className="text-gray-600">
              • Use Clear Canvas to remove inappropriate content
            </div>
            <div className="text-gray-600">
              • Toggle drawing to pause viewer interaction
            </div>
            <div className="text-gray-600">
              • Save memorable artwork for later
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold text-sm mb-2">OBS Integration</h3>
          <div className="space-y-1">
            <div className="text-xs text-gray-600 mb-1">
              Add this URL as Browser Source in OBS:
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}?obs=true` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
