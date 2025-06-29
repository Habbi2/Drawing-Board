'use client'

import { useState } from 'react'

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
  '#A52A2A', '#808080', '#000080', '#008000', '#FF69B4'
]

const LINE_WIDTHS = [1, 3, 5, 8, 12, 16]

export default function DrawingControls() {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedLineWidth, setSelectedLineWidth] = useState(3)

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    window.dispatchEvent(new CustomEvent('canvas-color-change', { detail: { color } }))
  }

  const handleLineWidthSelect = (lineWidth: number) => {
    setSelectedLineWidth(lineWidth)
    window.dispatchEvent(new CustomEvent('canvas-linewidth-change', { detail: { lineWidth } }))
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border">
      <div className="flex flex-col space-y-4">
        {/* Color Palette */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Colors</h3>
          <div className="flex flex-wrap gap-2 max-w-md">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                  selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Brush Size</h3>
          <div className="flex gap-2 items-center">
            {LINE_WIDTHS.map((width) => (
              <button
                key={width}
                className={`flex items-center justify-center w-12 h-8 rounded border-2 hover:bg-gray-50 transition-colors ${
                  selectedLineWidth === width ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => handleLineWidthSelect(width)}
                title={`Brush size ${width}px`}
              >
                <div
                  className="rounded-full bg-gray-800"
                  style={{
                    width: `${Math.min(width + 2, 12)}px`,
                    height: `${Math.min(width + 2, 12)}px`
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="text-xs text-gray-600 border-t pt-2">
          <div className="flex items-center gap-2">
            <span>Current:</span>
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: selectedColor }}
            />
            <span>{selectedLineWidth}px</span>
          </div>
        </div>
      </div>
    </div>
  )
}
