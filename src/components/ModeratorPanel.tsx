'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export default function ModeratorPanel() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(true)
  const [activeUsers, setActiveUsers] = useState<number>(0)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('user-count', (count: number) => {
      setActiveUsers(count)
    })

    newSocket.on('drawing-enabled', (enabled: boolean) => {
      setIsDrawingEnabled(enabled)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const clearCanvas = () => {
    if (socket) {
      socket.emit('clear-canvas')
    }
  }

  const toggleDrawing = () => {
    const newState = !isDrawingEnabled
    setIsDrawingEnabled(newState)
    if (socket) {
      socket.emit('toggle-drawing', newState)
    }
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

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border min-w-64">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Moderator Panel</h2>
          <div className="text-sm text-gray-600">
            Active viewers: <span className="font-semibold">{activeUsers}</span>
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
