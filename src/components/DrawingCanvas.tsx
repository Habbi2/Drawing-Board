'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface DrawData {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  lineWidth: number
  userId: string
}

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
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9))
  const [isConnected, setIsConnected] = useState(false)
  
  const drawLine = useCallback((data: DrawData) => {
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

  const sendDrawingData = async (drawData: DrawData) => {
    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'drawing',
          data: drawData
        })
      })
    } catch (error) {
      console.error('Failed to send drawing data:', error)
    }
  }
  
  // Initialize Server-Sent Events connection
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime')
    
    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setIsConnected(true)
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      setIsConnected(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'drawing':
            // Only draw if it's from another user
            if (message.data.userId !== userId) {
              drawLine(message.data)
            }
            break
          case 'clear-canvas':
            clearCanvas()
            break
          case 'user-count':
            console.log('Connected users:', message.count)
            break
          case 'drawing-enabled':
            console.log('Drawing enabled:', message.enabled)
            break
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [userId, drawLine, clearCanvas])

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

    const drawData: DrawData = {
      x: pos.x,
      y: pos.y,
      prevX,
      prevY,
      color: currentColor,
      lineWidth,
      userId
    }

    // Draw locally
    drawLine(drawData)

    // Send to other users via API
    console.log('Sending drawing data:', drawData)
    sendDrawingData(drawData)

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

    window.addEventListener('canvas-color-change', handleColorChange as EventListener)
    window.addEventListener('canvas-linewidth-change', handleLineWidthChange as EventListener)

    return () => {
      window.removeEventListener('canvas-color-change', handleColorChange as EventListener)
      window.removeEventListener('canvas-linewidth-change', handleLineWidthChange as EventListener)
    }
  }, [])

  return (
    <div className="flex items-center justify-center w-full h-full p-5">
      {/* Connection Status */}
      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
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
