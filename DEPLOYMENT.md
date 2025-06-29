# Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your code pushed to a GitHub repository

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Use default settings (Vercel auto-detects Next.js)
   - Click "Deploy"

3. **Configure Environment (if needed)**
   - In Vercel dashboard, go to your project
   - Navigate to Settings > Environment Variables
   - Add any required environment variables

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

#### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

#### Performance Optimization
- Vercel automatically optimizes Next.js apps
- Socket.io will use WebSockets for real-time communication
- Static assets are served from CDN

### Troubleshooting

#### Common Issues:
1. **Socket.io not connecting**: Check browser console for errors
2. **Canvas not loading**: Verify the URL parameters are correct
3. **Drawing not syncing**: Ensure all users are on the same deployed URL

#### Development vs Production:
- Development: `http://localhost:3000`
- Production: `https://your-project.vercel.app`
- Make sure to test with the production URL before going live

### Monitoring
- Vercel provides analytics and performance monitoring
- Check the Vercel dashboard for deployment status and logs
- Monitor real-time user connections in the moderator panel
