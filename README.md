# Stream Drawing Board

A real-time collaborative drawing board designed for streaming platforms. Viewers can draw on a shared canvas that appears live on your stream through OBS integration.

## Features

- **Real-time Collaboration**: Multiple viewers can draw simultaneously
- **OBS Integration**: Seamless overlay integration for streaming
- **Moderator Controls**: Clear canvas, save artwork, user tracking
- **Mobile Responsive**: Works on both desktop and mobile devices
- **No Eraser for Viewers**: Prevents accidental or malicious clearing
- **Transparent Background**: Perfect for OBS overlays
- **Firebase Backend**: Robust real-time synchronization

## Getting Started

### Prerequisites

1. **Firebase Project Setup**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable **Realtime Database**
   - Set database rules to allow read/write access:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Get your Firebase config from Project Settings > General > Web Apps

### Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with your Firebase configuration:
```bash
# Copy from env.example and fill in your Firebase project details
NEXT_PUBLIC_MODERATOR_PASSWORD=your_secure_password
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - All Firebase configuration variables
   - `NEXT_PUBLIC_MODERATOR_PASSWORD`
4. Deploy with default settings

## Usage

### For Streamers

1. **OBS Setup**: Add a Browser Source with the URL: `https://your-domain.vercel.app?obs=true`
2. **Moderator Panel**: Access moderation controls at: `https://your-domain.vercel.app?mod=true`
   - Use your configured moderator password
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
- **Real-time**: Firebase Realtime Database
- **Deployment**: Vercel

## Features Breakdown

### Drawing Tools
- Color palette with 15 preset colors
- Brush sizes from 1px to 16px
- Smooth line drawing with touch support

### Moderation
- Clear canvas button
- Save canvas as PNG
- Real-time user count
- Connection status monitoring

### OBS Integration
- Transparent background support
- Configurable canvas dimensions
- Minimal UI for overlay mode
- Low-latency updates via Firebase

## Security

### Moderator Authentication
- The moderator panel requires a password to prevent unauthorized access
- Set `NEXT_PUBLIC_MODERATOR_PASSWORD` environment variable

### Firebase Security
- Configure Firebase Database Rules according to your needs
- For production, consider implementing Firebase Authentication
- Current setup allows public read/write for simplicity

### Setting Environment Variables

#### Local Development
Create `.env.local` file with all required variables from `env.example`.

#### Production (Vercel)
1. In Vercel dashboard, go to your project
2. Navigate to Settings > Environment Variables
3. Add all Firebase configuration variables
4. Add `NEXT_PUBLIC_MODERATOR_PASSWORD`
5. Redeploy the application

## Development Notes

The project uses:
- Next.js App Router
- Firebase Realtime Database for real-time sync
- Custom React hooks for Firebase integration
- Responsive design principles
- TypeScript for type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
