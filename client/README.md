# Frontend Client

React frontend for the Cattle Breed Recognition system.

## ✨ Features

- **Image Upload & Capture**: Drag & drop file upload with camera support
- **AI-Powered Recognition**: Real-time breed identification with confidence scores
- **41 Breed Support**: Identifies 36 cattle breeds + 5 buffalo breeds
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **User Authentication**: Clerk-based secure authentication
- **Results Display**: Beautiful prediction results with breed information and species
- **History Tracking**: View past predictions and analytics
- **Breed Database**: Browse and search all supported breeds
- **User Dashboard**: Personal statistics and prediction history

## 🛠️ Tech Stack

- **React 19** - Latest React with Vite for fast development
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing and navigation
- **Clerk** - Authentication and user management
- **Vite** - Lightning-fast build tool and dev server

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend server running on port 5002

### Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the sample environment file:
   ```bash
   cp .envSample .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5002/api
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   ```
   
   Get your Clerk key from [Clerk Dashboard](https://dashboard.clerk.com)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components (buttons, cards, etc.)
│   │   ├── layout/            # Layout components (header, footer, nav)
│   │   └── features/          # Feature-specific components
│   ├── pages/                 # Page components (Home, Dashboard, Breeds, etc.)
│   ├── services/
│   │   └── api.js             # Axios API client with Clerk auth
│   ├── utils/                 # Utility functions and helpers
│   ├── hooks/                 # Custom React hooks
│   ├── App.jsx                # Main application with routing
│   └── main.jsx               # Entry point with Clerk provider
├── public/                    # Static assets
├── .env                       # Environment variables
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (outputs to `/dist`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎨 Key Features Explained

### Image Upload
- Drag and drop interface
- File picker with validation
- Camera capture support (on supported devices)
- Image preview before prediction
- File type validation (JPEG, PNG only)
- File size limit (10MB)

### Prediction Results
- Breed name with confidence percentage
- Species classification (cow/buffalo)
- Top 5 alternative predictions
- Inference time display
- Breed information and characteristics
- Save to history option

### User Dashboard
- Total scans made
- Unique breeds identified
- Recent prediction history
- Prediction accuracy trends
- Favorite breeds

## 🔧 Configuration

### Vite Configuration
The `vite.config.js` includes:
- React plugin for Fast Refresh
- Path aliases for cleaner imports
- Proxy configuration for API calls
- Build optimizations

### Tailwind Configuration
Custom theme in `tailwind.config.js`:
- Custom color palette
- Extended spacing and sizing
- Custom animations
- Responsive breakpoints

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build outputs to `/dist` directory and can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables for Production
Update `.env` for production:
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clerk authentication issues
1. Verify your publishable key in `.env`
2. Check Clerk dashboard for correct domain configuration
3. Clear browser cache and cookies

### API connection errors
1. Ensure backend server is running on port 5002
2. Check CORS configuration in backend
3. Verify `VITE_API_URL` in `.env`

---

**Built with ❤️ using React and Tailwind CSS**
