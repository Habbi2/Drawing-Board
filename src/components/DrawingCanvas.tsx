'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useFirebaseDrawing, generateUserId, DrawingEvent } from '../lib/useFirebaseDrawing'

interface CanvasSize {
  width: number
  height: number
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 })
  const [userId] = useState(() => generateUserId())
  
  const {
    events,
    connectionStatus,
    addDrawingEvent,
    clearDrawing,
    registerUser
  } = useFirebaseDrawing()

  // Register user when component mounts
  useEffect(() => {
    const cleanup = registerUser(userId)
    return cleanup
  }, [userId, registerUser])
  
  const drawLine = useCallback((data: { x: number, y: number, prevX: number, prevY: number, color: string, lineWidth: number }) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = data.color
    ctx.lineWidth = data.lineWidth

    ctx.beginPath()
    ctx.moveTo(data.prevX, data.prevY)
    ctx.lineTo(data.x, data.y)
    ctx.stroke()
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas!.width, canvas!.height)
  }, [])

  // Track processed events to avoid reprocessing
  const [processedEventIds, setProcessedEventIds] = useState<Set<string>>(new Set())
  const [hasInitialized, setHasInitialized] = useState(false)

  // Process Firebase events
  useEffect(() => {
    if (!events.length) return

    // On first load, replay all events to show current state
    if (!hasInitialized) {
      clearCanvas() // Start with clean canvas
      
      // Process all events in order
      events.forEach(event => {
        if (event.type === 'clear') {
          clearCanvas()
        } else if (event.type === 'draw') {
          // Draw all events including our own during initialization
          if (event.x !== undefined && event.y !== undefined && 
              event.prevX !== undefined && event.prevY !== undefined &&
              event.color && event.lineWidth) {
            drawLine({
              x: event.x,
              y: event.y,
              prevX: event.prevX,
              prevY: event.prevY,
              color: event.color,
              lineWidth: event.lineWidth
            })
          }
        }
      })
      
      // Mark all current events as processed
      const eventIds = new Set(events.map(e => e.id).filter(Boolean) as string[])
      setProcessedEventIds(eventIds)
      setHasInitialized(true)
      return
    }

    // Process only new events after initialization
    events.forEach(event => {
      if (!event.id || processedEventIds.has(event.id)) return

      if (event.type === 'clear') {
        clearCanvas()
        // Clear processed events since canvas is now empty
        setProcessedEventIds(new Set([event.id]))
      } else if (event.type === 'draw' && event.userId !== userId) {
        // Only draw events from other users to avoid double-drawing
        if (event.x !== undefined && event.y !== undefined && 
            event.prevX !== undefined && event.prevY !== undefined &&
            event.color && event.lineWidth) {
          drawLine({
            x: event.x,
            y: event.y,
            prevX: event.prevX,
            prevY: event.prevY,
            color: event.color,
            lineWidth: event.lineWidth
          })
        }
      }
      
      // Mark event as processed
      if (event.id) {
        setProcessedEventIds(prev => new Set([...prev, event.id!]))
      }
    })
  }, [events, userId, drawLine, clearCanvas, processedEventIds, hasInitialized])

  // Debug connection status
  useEffect(() => {
    console.log('Firebase connection status:', connectionStatus)
    console.log('Total events loaded:', events.length)
    console.log('Has initialized:', hasInitialized)
  }, [connectionStatus, events.length, hasInitialized])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newWidth = Math.min(rect.width - 40, 1200)
      const newHeight = Math.min(rect.height - 40, 800)
      
      setCanvasSize({ width: newWidth, height: newHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getCanvasPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Only preventDefault for mouse events, not touch events
    if ('button' in e) {
      e.preventDefault()
    }
    const pos = getCanvasPosition(e)
    setIsDrawing(true)
    
    // Store the starting position
    const canvas = canvasRef.current
    if (canvas) {
      canvas.dataset.lastX = pos.x.toString()
      canvas.dataset.lastY = pos.y.toString()
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    // Only preventDefault for mouse events, not touch events
    if ('button' in e) {
      e.preventDefault()
    }
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const pos = getCanvasPosition(e)
    const prevX = parseFloat(canvas.dataset.lastX || '0')
    const prevY = parseFloat(canvas.dataset.lastY || '0')

    const drawData = {
      x: pos.x,
      y: pos.y,
      prevX,
      prevY,
      color: currentColor,
      lineWidth,
    }

    // Draw locally first for immediate feedback
    drawLine(drawData)

    // Send to Firebase for other users
    addDrawingEvent({
      type: 'draw',
      ...drawData,
      userId
    })

    // Update last position
    canvas.dataset.lastX = pos.x.toString()
    canvas.dataset.lastY = pos.y.toString()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Expose methods for external controls
  useEffect(() => {
    const handleColorChange = (e: CustomEvent) => {
      setCurrentColor(e.detail.color)
    }

    const handleLineWidthChange = (e: CustomEvent) => {
      setLineWidth(e.detail.lineWidth)
    }

    const handleClearCanvas = () => {
      clearDrawing(userId)
    }

    window.addEventListener('canvas-color-change', handleColorChange as EventListener)
    window.addEventListener('canvas-linewidth-change', handleLineWidthChange as EventListener)
    window.addEventListener('canvas-clear', handleClearCanvas)

    return () => {
      window.removeEventListener('canvas-color-change', handleColorChange as EventListener)
      window.removeEventListener('canvas-linewidth-change', handleLineWidthChange as EventListener)
      window.removeEventListener('canvas-clear', handleClearCanvas)
    }
  }, [userId, clearDrawing])

  return (
    <div className="flex items-center justify-center w-full h-full p-5">
      {/* Connection Status */}
      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
        connectionStatus.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {connectionStatus.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        <span className="ml-2">
          👥 {connectionStatus.activeUsers} user{connectionStatus.activeUsers !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading indicator */}
      {!hasInitialized && connectionStatus.isConnected && (
        <div className="absolute top-2 right-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
          📥 Loading drawing...
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-2 border-gray-300 bg-white cursor-crosshair drawing-canvas rounded-lg shadow-lg"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'manipulation' }}
      />
    </div>
  )
}
