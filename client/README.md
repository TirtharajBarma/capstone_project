# BreedVision AI - Frontend

A modern, AI-powered React dashboard for cattle and buffalo breed recognition with a sleek neumorphism design and futuristic UI touches.

## ✨ Features

### 🎨 **Modern UI Design**
- **Neumorphism Design**: Soft shadows and elevated cards
- **Glass Morphism**: Transparent cards with backdrop blur
- **Gradient Accents**: Beautiful blue to purple gradients
- **Futuristic Elements**: Glowing buttons, floating animations
- **Responsive Layout**: Mobile-first design with touch-friendly interactions

### 📸 **Image Upload & Capture**
- **Drag & Drop**: Intuitive file dropping with visual feedback
- **Camera Integration**: Mobile camera capture support
- **File Validation**: JPEG/PNG support up to 5MB
- **Preview**: Real-time image preview before processing
- **Progress Tracking**: Upload progress indication

### 🧠 **AI-Powered Recognition**
- **Real-time Processing**: Instant breed identification
- **Confidence Scores**: Visual confidence indicators
- **Multiple Predictions**: Top prediction alternatives
- **Breed Information**: Detailed breed characteristics and info
- **Performance Metrics**: Processing time display

### 🎯 **Smart Navigation**
- **Clean Header**: Professional navigation bar
- **Responsive Menu**: Mobile hamburger menu
- **Active States**: Visual route indicators
- **User Management**: Login/logout functionality
- **Breadcrumbs**: Clear navigation context

### 📊 **Results Display**
- **Prediction Cards**: Beautiful result presentation
- **Breed Details**: Comprehensive breed information
- **Action Buttons**: Save, share, download functionality
- **Visual Indicators**: Confidence meters and status icons
- **Interactive Elements**: Hover effects and animations

## 🛠️ **Tech Stack**

### **Core Framework**
- ⚛️ **React 19** - Latest React with concurrent features
- 🚀 **Vite** - Fast build tool and dev server
- 📱 **React Router** - Client-side routing

### **Styling & UI**
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎭 **Custom CSS** - Neumorphism and glass effects
- 🎪 **Lucide React** - Beautiful icon library
- 💫 **CSS Animations** - Smooth transitions and effects

### **API & State**
- 🌐 **Axios** - HTTP client with interceptors
- 📊 **Chart.js** - Data visualization (ready for analytics)
- 🔄 **React Hooks** - Modern state management

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Backend server running on port 5002

### **Installation**

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The `.env` file is already configured:
   ```env
   VITE_API_URL=http://localhost:5002/api
   VITE_APP_NAME=BreedVision AI
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📁 **Project Structure**

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.jsx         # Custom button with variants
│   │   ├── Card.jsx           # Card components with styles
│   │   ├── Input.jsx          # Form input components
│   │   ├── Modal.jsx          # Modal dialog component
│   │   └── index.js           # Component exports
│   └── layout/                # Layout components
│       ├── Navigation.jsx     # Header navigation
│       ├── Dashboard.jsx      # Main upload interface
│       └── ResultsPanel.jsx   # Results display
├── services/
│   └── api.js                 # API integration layer
├── utils/
│   └── cn.js                  # Utility functions
├── App.jsx                    # Main application component
├── main.jsx                   # Application entry point
└── index.css                  # Global styles and Tailwind
```

## 🎨 **Design System**

### **Color Palette**
```css
Primary Blue:   #0ea5e9 → #0284c7
Secondary Purple: #a855f7 → #9333ea
Neutral Grays:  #fafafa → #171717
Success Green:  #10b981
Warning Yellow: #f59e0b
Error Red:      #ef4444
```

## 🔧 **Component Library**

### **Button Component**
```jsx
<Button variant="default" size="lg" icon={<Upload />}>
  Upload Photo
</Button>
```
**Variants**: `default`, `primary`, `secondary`, `outline`, `ghost`, `neumorph`, `glass`

### **Card Component**
```jsx
<Card variant="neumorph" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🌐 **API Integration**

### **Service Layer**
```javascript
// Prediction API
await predictionAPI.predict(imageFile, onProgress);
await predictionAPI.getById(predictionId);

// Breeds API
await breedsAPI.getAll({ page: 1, limit: 20 });
await breedsAPI.getByName(breedName, species);

// History API
await historyAPI.getHistory({ species: 'cattle' });
await historyAPI.getStats();
```

## 📱 **Responsive Design**

### **Mobile Optimizations**
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for navigation
- Optimized image upload for mobile cameras
- Collapsible navigation menu

### **Tablet & Desktop**
- Multi-column layouts
- Hover effects and animations
- Keyboard navigation support
- Advanced drag & drop functionality

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] User authentication and profiles
- [ ] Prediction history with filtering
- [ ] Analytics dashboard with charts
- [ ] Offline mode with service worker
- [ ] Push notifications for results
- [ ] Advanced image editing tools
- [ ] Bulk image processing
- [ ] Social sharing integration

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
