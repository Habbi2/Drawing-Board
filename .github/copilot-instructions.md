<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Stream Drawing Board - Copilot Instructions

This is a Next.js TypeScript project for a real-time collaborative drawing board designed for streaming platforms.

## Project Context

- **Purpose**: Real-time drawing board for stream overlays where viewers can draw and streamers can moderate
- **Technology**: Next.js 15, TypeScript, Socket.io, Tailwind CSS, HTML5 Canvas
- **Deployment**: Optimized for Vercel hosting

## Key Components

1. **DrawingCanvas** (`src/components/DrawingCanvas.tsx`): Main canvas component with drawing logic
2. **DrawingControls** (`src/components/DrawingControls.tsx`): Color and brush size controls for viewers
3. **ModeratorPanel** (`src/components/ModeratorPanel.tsx`): Admin controls for streamers
4. **Socket Handler** (`src/pages/api/socket.ts`): Real-time communication backend

## Development Guidelines

### Code Style
- Use TypeScript for all components
- Prefer functional components with hooks
- Use Tailwind CSS for styling
- Follow Next.js App Router conventions

### Real-time Features
- All drawing data should be synchronized via Socket.io
- Implement proper error handling for network issues
- Consider performance for multiple simultaneous users

### OBS Integration
- Support transparent backgrounds with `obs-transparent` class
- Ensure UI elements can be hidden in overlay mode
- Optimize for low-latency streaming

### Security Considerations
- Viewers should not have erase capabilities
- Implement rate limiting for drawing events
- Validate all incoming drawing data
- Provide moderation tools for inappropriate content

### Mobile Support
- Ensure touch events work properly on mobile devices
- Make controls accessible on small screens
- Handle responsive canvas sizing

### Performance
- Optimize canvas rendering for smooth drawing
- Implement efficient socket event handling
- Consider canvas size limitations
- Handle memory management for long sessions

## Common Tasks

When adding new features:
1. Consider real-time synchronization requirements
2. Ensure mobile compatibility
3. Test OBS integration
4. Verify moderator controls work properly
5. Check for appropriate TypeScript types

When debugging:
1. Check browser console for Socket.io connection issues
2. Verify canvas event handling
3. Test drawing synchronization between multiple browsers
4. Ensure proper error handling for network disconnections
