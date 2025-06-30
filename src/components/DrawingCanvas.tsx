'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

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
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 })
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9))
  
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
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io({
      path: '/api/socket'
    })
    setSocket(newSocket)

    newSocket.on('drawing', (data: DrawData) => {
      if (data.userId !== userId) {
        drawLine(data)
      }
    })

    newSocket.on('clear-canvas', () => {
      clearCanvas()
    })

    return () => {
      newSocket.close()
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

    // Send to other users
    socket?.emit('drawing', drawData)

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
