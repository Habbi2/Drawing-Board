'use client'

import { useState, useEffect } from 'react'
import DrawingCanvas from '@/components/DrawingCanvas'
import DrawingControls from '@/components/DrawingControls'
import ModeratorPanel from '@/components/ModeratorPanel'

export default function Home() {
  const [isOBSMode, setIsOBSMode] = useState(false)
  const [isModerator, setIsModerator] = useState(false)

  useEffect(() => {
    // Check URL parameters for OBS mode
    const urlParams = new URLSearchParams(window.location.search)
    setIsOBSMode(urlParams.get('obs') === 'true')
    setIsModerator(urlParams.get('mod') === 'true')
  }, [])

  return (
    <main className={`min-h-screen ${isOBSMode ? 'obs-transparent' : 'bg-gray-100'}`}>
      <div className={`relative w-full h-screen ${isOBSMode ? 'obs-overlay' : ''}`}>
        <DrawingCanvas />
        
        {!isOBSMode && (
          <>
            <DrawingControls />
            {isModerator && <ModeratorPanel />}
          </>
        )}
        
        {!isOBSMode && !isModerator && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-2">Stream Drawing Board</h1>
            <p className="text-sm text-gray-600 mb-2">
              Draw on the canvas and see it appear live on stream!
            </p>
            <div className="flex gap-2 text-xs">
              <a 
                href="?obs=true" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                OBS Overlay URL
              </a>
              <span>|</span>
              <a 
                href="?mod=true" 
                className="text-green-600 hover:underline"
              >
                Moderator Panel
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
