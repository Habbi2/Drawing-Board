# Deployment Guide

## Prerequisites

### Firebase Setup
1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Choose your project name and region

2. **Enable Realtime Database**
   - In Firebase console, go to Build > Realtime Database
   - Click "Create Database"
   - Choose your location
   - Start in **test mode** for now (we'll configure rules later)

3. **Configure Database Rules**
   - In Realtime Database, go to Rules tab
   - Replace the rules with:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Click "Publish"
   - **Note**: These are permissive rules for simplicity. For production, implement proper security rules.

4. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Add app" > Web (</>) icon
   - Register your app with a nickname
   - Copy the Firebase configuration object

## Deploying to Vercel

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Firebase integration"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Use default settings (Vercel auto-detects Next.js)

3. **Configure Environment Variables**
   - Before deploying, add environment variables in Vercel
   - In project settings, go to Environment Variables
   - Add the following variables with your Firebase config:

   ```
   NEXT_PUBLIC_MODERATOR_PASSWORD=your_secure_password
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for deployment to complete

### Using Your Deployed Drawing Board

After deployment, you'll get a URL like: `https://your-project.vercel.app`

#### For Streamers:
- **OBS Browser Source**: `https://your-project.vercel.app?obs=true`
- **Moderator Panel**: `https://your-project.vercel.app?mod=true`

#### For Viewers:
- **Drawing Interface**: `https://your-project.vercel.app`

### OBS Setup Instructions

1. **Add Browser Source**
   - In OBS, add a new Browser Source
   - URL: `https://your-project.vercel.app?obs=true`
   - Width: 1920 (or your stream width)
   - Height: 1080 (or your stream height)
   - Check "Shutdown source when not visible"
   - Check "Refresh browser when scene becomes active"

2. **Position the Canvas**
   - Resize and position the browser source as needed
   - The canvas will automatically adjust to fit
   - Background is transparent in OBS mode

### Advanced Configuration

#### Firebase Security (Production)
For production use, consider implementing proper Firebase security rules:

```json
{
  "rules": {
    "drawing": {
      "events": {
        ".read": true,
        ".write": "auth != null || root.child('settings/publicDrawing').val() === true"
      },
      "activeUsers": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

#### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

#### Performance Optimization
- Firebase Realtime Database provides automatic scaling
- Vercel serves static assets from CDN
- Real-time updates are handled by Firebase infrastructure

### Troubleshooting

#### Common Issues:
1. **Firebase not connecting**: 
   - Check browser console for Firebase errors
   - Verify environment variables are set correctly
   - Ensure Firebase Database is enabled

2. **Canvas not loading**: 
   - Verify the URL parameters are correct
   - Check if Firebase configuration is valid

3. **Drawing not syncing**: 
   - Ensure all users are connected to Firebase
   - Check Firebase Database rules allow read/write access
   - Monitor Firebase usage in console

#### Development vs Production:
- Development: `http://localhost:3000` (with `.env.local`)
- Production: `https://your-project.vercel.app` (with Vercel env vars)
- Firebase works in both environments with same configuration

### Monitoring
- Monitor Firebase usage in Firebase Console
- Check Vercel analytics for deployment status and performance
- Use Firebase Realtime Database monitor to see active connections
- Monitor real-time user count in the moderator panel
