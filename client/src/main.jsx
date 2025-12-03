import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          elements: {
            modalBackdrop: "backdrop-blur-sm bg-black/50",
            modalContent: "bg-white rounded-xl shadow-2xl border-0",
            modalCloseButton: "text-gray-400 hover:text-gray-600",
            formButtonPrimary: "bg-gray-900 hover:bg-gray-800 text-white rounded-lg",
            footerActionLink: "text-indigo-600 hover:text-indigo-500",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-500"
          }
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
)
