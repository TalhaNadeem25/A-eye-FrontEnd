# 🎥 Camera Surveillance + Alert Dashboard

A modern, responsive web application for monitoring camera feeds and managing security alerts. Built with Next.js 15, TypeScript, and TailwindCSS for a professional surveillance system interface.

## ✨ Features

### 🔐 Authentication
- **Manager Login Portal** - Secure authentication interface
- **Demo Credentials** - Ready-to-use test accounts
- **Professional UI** - Auth0-style login design

### 📹 Camera Management
- **Live Camera Feeds** - Real-time surveillance monitoring
- **Multi-Camera Support** - Grid layout for multiple cameras
- **Camera Status** - Online/offline indicators
- **Alert Integration** - Visual alerts on camera feeds

### 🚨 Alert System
- **Real-time Alerts** - Instant notification system
- **Alert Management** - Acknowledge, dismiss, and track alerts
- **Confidence Scoring** - AI detection confidence levels
- **Alert Filtering** - Search and filter by status
- **Audio Alerts** - ElevenLabs integration for voice notifications

### 🎵 Audio Features
- **Audio Player** - Built-in audio controls
- **Volume Control** - Adjustable audio levels
- **Playback Controls** - Play, pause, and seek functionality
- **Mute Options** - Quick mute/unmute controls

### 📱 Responsive Design
- **Mobile-First** - Optimized for all screen sizes
- **Dark Theme** - Professional surveillance system appearance
- **Touch-Friendly** - Mobile gesture support
- **Professional UI** - Clean, modern interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Login
- **Email**: `manager@demo.com`
- **Password**: `demo123`

## 🏗️ Project Structure

```
my-nextjs-app/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── CameraFeed.tsx  # Camera feed component
│   │   ├── AlertPanel.tsx # Alerts management panel
│   │   ├── EventCard.tsx  # Individual alert cards
│   │   └── AudioPlayer.tsx # Audio playback controls
│   ├── dashboard/          # Dashboard pages
│   │   └── page.tsx       # Main dashboard
│   ├── login/             # Authentication
│   │   └── page.tsx       # Login page
│   ├── globals.css        # Global styles & theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to login)
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0a` (Deep black)
- **Cards**: `#1a1a1a` (Dark gray)
- **Primary**: `#3b82f6` (Blue)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Destructive**: `#ef4444` (Red)

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Responsive**: Mobile-first approach
- **Accessibility**: High contrast ratios

## 🔧 Key Components

### CameraFeed Component
```tsx
<CameraFeed
  cameraId="CAM-001"
  cameraName="Main Entrance"
  isOnline={true}
  hasAlert={true}
  alertLevel="high"
/>
```

### AlertPanel Component
```tsx
<AlertPanel
  alerts={alerts}
  onAcknowledge={handleAcknowledge}
  onDismiss={handleDismiss}
/>
```

### AudioPlayer Component
```tsx
<AudioPlayer
  audioUrl="/api/audio/alert.mp3"
  isPlaying={isPlaying}
  onPlayStateChange={handlePlayStateChange}
/>
```

## 📊 Dashboard Features

### Real-time Statistics
- **Online Cameras** - Live camera count
- **New Alerts** - Unacknowledged alerts
- **Total Alerts** - All-time alert count
- **System Status** - Overall system health

### Camera Grid
- **2x2 Layout** - Optimal viewing experience
- **Live Feeds** - Real-time camera streams
- **Alert Indicators** - Visual alert status
- **Controls** - Play/pause, mute, fullscreen

### Alerts Panel
- **Scrollable List** - Handle large numbers of alerts
- **Filter Options** - By status (new, acknowledged, dismissed)
- **Search Function** - Find specific alerts
- **Action Buttons** - Acknowledge or dismiss alerts

## 🎯 Hackathon Ready

This project is specifically designed for hackathon environments:

- ⚡ **Fast Setup** - Get running in minutes
- 🎨 **Professional UI** - Impressive visual design
- 📱 **Responsive** - Works on all devices
- 🔧 **Modular** - Easy to extend and customize
- 📚 **Well Documented** - Clear code structure

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: `npm run build && npm run start`
- **Railway**: Connect GitHub repository
- **Heroku**: Add buildpack for Node.js

## 🔮 Future Enhancements

- **Real Camera Integration** - Connect to actual IP cameras
- **AI Detection** - Implement computer vision
- **Push Notifications** - Browser notification support
- **User Management** - Multi-user authentication
- **Historical Data** - Alert history and analytics
- **Mobile App** - React Native companion app

## 📝 License

MIT License - Feel free to use for your hackathon project!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for Hackathon 2025**

*Professional surveillance dashboard ready for demo in 24 hours!*