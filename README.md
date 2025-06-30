# Stream Drawing Board

A real-time collaborative drawing board designed for streaming platforms. Viewers can draw on a shared canvas that appears live on your stream through OBS integration.

## Features

- **Real-time Collaboration**: Multiple viewers can draw simultaneously
- **OBS Integration**: Seamless overlay integration for streaming
- **Moderator Controls**: Clear canvas, toggle drawing permissions, save artwork
- **Mobile Responsive**: Works on both desktop and mobile devices
- **No Eraser for Viewers**: Prevents accidental or malicious clearing
- **Transparent Background**: Perfect for OBS overlays

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

## Usage

### For Streamers

1. **OBS Setup**: Add a Browser Source with the URL: `https://your-domain.vercel.app?obs=true`
2. **Moderator Panel**: Access moderation controls at: `https://your-domain.vercel.app?mod=true`
   - **Default password**: `stream123` (change this in production!)
   - Set custom password using `NEXT_PUBLIC_MODERATOR_PASSWORD` environment variable
3. **Share with Viewers**: Give viewers the main URL: `https://your-domain.vercel.app`

### For Viewers

1. Visit the shared URL
2. Select colors and brush sizes
3. Draw on the canvas
4. See everyone's contributions in real-time

## URL Parameters

- `?obs=true` - OBS overlay mode (transparent background, no UI)
- `?mod=true` - Moderator panel with admin controls
- No parameters - Regular viewer interface

## Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **Deployment**: Vercel

## Features Breakdown

### Drawing Tools
- Color palette with 15 preset colors
- Brush sizes from 1px to 16px
- Smooth line drawing with touch support

### Moderation
- Clear canvas button
- Toggle drawing permissions
- Save canvas as PNG
- Real-time user count
- Drawing enable/disable status

### OBS Integration
- Transparent background support
- Configurable canvas dimensions
- Minimal UI for overlay mode
- Low-latency updates

## Security

### Moderator Authentication
- The moderator panel requires a password to prevent unauthorized access
- **Default password**: `stream123` (for development only)
- **Production**: Set `NEXT_PUBLIC_MODERATOR_PASSWORD` environment variable in Vercel

### Setting Custom Password
1. In Vercel dashboard, go to your project
2. Navigate to Settings > Environment Variables
3. Add: `NEXT_PUBLIC_MODERATOR_PASSWORD` with your secure password
4. Redeploy the application

## Development Notes

The project uses:
- Next.js App Router
- Socket.io for real-time communication
- HTML5 Canvas for drawing
- Custom events for component communication
- Responsive design principles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
