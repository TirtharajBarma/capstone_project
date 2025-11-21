# Frontend Client

React frontend for the Cattle Breed Recognition system.

## ✨ Features

- **Image Upload & Capture**: Drag & drop file upload with camera support
- **AI-Powered Recognition**: Real-time breed identification with confidence scores
- **Responsive Design**: Mobile-first design with modern UI
- **User Authentication**: Clerk-based authentication
- **Results Display**: Beautiful prediction results with breed information
- **History Tracking**: View past predictions and analytics

## 🛠️ Tech Stack

- **React 19** - Latest React with Vite
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Clerk** - Authentication

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
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5002/api
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   └── layout/                # Layout components
├── pages/                     # Page components
├── services/
│   └── api.js                 # API integration
├── utils/                     # Utility functions
├── App.jsx                    # Main application
└── main.jsx                   # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

**Built with ❤️ using React and Tailwind CSS**
