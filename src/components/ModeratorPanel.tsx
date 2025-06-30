'use client'

import { useState, useEffect } from 'react'
import { useFirebaseDrawing, generateUserId } from '../lib/useFirebaseDrawing'

export default function ModeratorPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [userId] = useState(() => generateUserId())

  const {
    connectionStatus,
    clearDrawing,
    registerUser
  } = useFirebaseDrawing()

  // Simple password - in production, use environment variables or proper auth
  const MODERATOR_PASSWORD = process.env.NEXT_PUBLIC_MODERATOR_PASSWORD || 'stream123'

  // Register moderator as active user when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    
    const cleanup = registerUser(`moderator_${userId}`)
    return cleanup
  }, [isAuthenticated, userId, registerUser])

  const clearCanvas = () => {
    clearDrawing(`moderator_${userId}`)
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
            <div>Active users: <span className="font-semibold">{connectionStatus.activeUsers}</span></div>
            <div className={`text-xs font-semibold ${
              connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus.isConnected ? '🟢 Connected to Firebase' : '🔴 Disconnected'}
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
              • Save memorable artwork for later
            </div>
            <div className="text-gray-600">
              • Real-time sync via Firebase Realtime Database
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
