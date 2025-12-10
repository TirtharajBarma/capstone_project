# Cattle Breed Identifier - Expo Mobile App

React Native mobile app built with Expo for cattle breed identification. This app integrates with your existing Node.js backend and uses Clerk for authentication.

## 🚀 Features

- **Clerk Authentication**: Secure sign-in/sign-up with Clerk (same as web app)
- **Profile Screen**: View user statistics (scans, breeds identified, favorites)
- **Backend Integration**: Connects to the same Node.js API as the web app
- **Secure Token Storage**: Uses Expo SecureStore for authentication tokens
- **Dark Mode Support**: Automatic light/dark theme based on device settings
- **Cross-Platform**: Single codebase for both iOS and Android
- **Native Performance**: Built with React Native for smooth native experience

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Clerk account with a configured application

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
cd expo
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `/expo` directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Backend API URL
# For development (adjust IP to your machine's local IP)
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5002/api

# For production
# EXPO_PUBLIC_API_URL=https://your-backend.com/api
```

**Important Notes:**
- Replace `your_clerk_key_here` with your actual Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
- For local development, replace `192.168.1.XXX` with your machine's local IP address (not `localhost` as that won't work on physical devices)
- To find your local IP:
  - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - Windows: `ipconfig`
  - Linux: `ip addr show`

### 3. Update app.json (Optional)

Update the `extra` section in `app.json` to include environment variables:

```json
"extra": {
  "clerkPublishableKey": process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  "apiUrl": process.env.EXPO_PUBLIC_API_URL
}
```

### 4. Configure Clerk for React Native

In your Clerk Dashboard:

1. Go to your application settings
2. Navigate to "API Keys"
3. Copy your publishable key
4. Under "Configure" → "Paths", ensure your redirect URLs are configured:
   - Add `exp://localhost:8081` for development
   - Add your custom scheme: `cattle-breed-identifier://`

## 🏃 Running the App

### Start Expo Development Server

```bash
npm start
```

This will open the Expo DevTools in your browser.

### Run on iOS Simulator

```bash
npm run ios
```

Requirements:
- macOS
- Xcode installed
- iOS Simulator

### Run on Android Emulator

```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator configured and running

### Run on Physical Device

1. Install **Expo Go** app from:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from the terminal or Expo DevTools

**Important**: Your phone and development machine must be on the same Wi-Fi network.

## 📱 App Structure

```
expo/
├── app/                      # Expo Router pages
│   ├── _layout.js           # Root layout with Clerk provider
│   ├── index.js             # Entry point with auth redirect
│   ├── sign-in.js           # Sign-in screen
│   └── profile.js           # Profile screen
├── components/              # Reusable components
│   ├── ProfileHeader.js     # Profile header with avatar
│   ├── StatCard.js          # Statistics card component
│   └── MenuItem.js          # Menu item component
├── context/                 # React context providers
│   └── UserContext.js       # User data and auth context
├── api/                     # API client
│   └── client.js            # Axios instance with Clerk auth
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## 🔐 Authentication Flow

1. **App Launch**: Checks if user is signed in
   - Not signed in → Redirects to sign-in screen
   - Signed in → Redirects to profile screen

2. **Sign In**: User signs in via Clerk
   - Token stored securely in device's Secure Store
   - User data synced with backend MongoDB

3. **API Calls**: All authenticated requests include:
   ```
   Authorization: Bearer <clerk_token>
   ```

4. **Backend Verification**: Node.js server verifies Clerk token using `ClerkExpressRequireAuth` middleware

## 🔌 API Integration

The app uses the same backend endpoints as your web app:

### User Endpoints
- `GET /api/users/profile/:clerkId` - Get user profile
- `POST /api/users/sync` - Sync user with backend
- `GET /api/users/statistics/:clerkId` - Get user statistics

### Prediction Endpoints
- `POST /api/predictions/predict` - Predict cattle breed
- `GET /api/predictions/history/:clerkId` - Get prediction history
- `GET /api/predictions/:predictionId` - Get specific prediction

### Breed Endpoints
- `GET /api/breeds` - Get all breeds
- `GET /api/breeds/:name` - Get breed by name

All API calls are handled through the centralized API client in `/api/client.js`, which automatically adds Clerk authentication tokens.

## 🎨 Current Screens

### Profile Screen
- User profile with avatar and email
- Statistics cards:
  - Scans Made
  - Breeds Identified
  - Favorites Saved
- Account menu:
  - Edit Profile
  - App Settings
- Support menu:
  - Help & Support
  - Privacy Policy
- Log Out button

## 🚧 Coming Soon

- **Camera/Gallery Integration**: Take photos or select from gallery for breed prediction
- **Prediction History Screen**: View all past predictions with filtering
- **Breed Details Screen**: Detailed information about each breed
- **Dashboard with Analytics**: Visual charts and statistics
- **Settings Screen**: App preferences and account settings
- **Push Notifications**: Get notified about prediction results
- **Offline Mode**: Cache breed data for offline viewing
- **Share Results**: Share predictions on social media

## 🐛 Troubleshooting

### "Unable to resolve module" errors
```bash
npm install
npx expo start --clear
```

### Clerk authentication not working
1. Verify your publishable key in `.env`
2. Check that Clerk redirect URLs are configured
3. Ensure backend is running and accessible

### API calls failing
1. Verify backend is running on port 5002
2. Check that `EXPO_PUBLIC_API_URL` has correct IP (not localhost)
3. Test backend endpoint directly: `curl http://YOUR_IP:5002/api/breeds`

### Dark mode not working
- Device system settings control the theme
- iOS: Settings → Display & Brightness → Dark
- Android: Settings → Display → Dark theme

### Expo Go app crashes
1. Clear Expo cache: `npx expo start --clear`
2. Restart Expo Go app
3. Check for console errors in terminal

## 📦 Dependencies

### Core
- `expo` - Expo SDK
- `expo-router` - File-based routing
- `react-native` - React Native framework

### Authentication
- `@clerk/clerk-expo` - Clerk authentication for Expo
- `expo-secure-store` - Secure token storage

### UI & Navigation
- `@react-navigation/native` - Navigation library
- `@react-navigation/native-stack` - Stack navigator
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen optimization

### API & Data
- `axios` - HTTP client
- `expo-constants` - Access to environment variables

### Media (for future features)
- `expo-image-picker` - Camera and gallery access

## 📝 Notes

- **Language**: Plain JavaScript (no TypeScript)
- **Backend**: Uses the same Node.js backend as web app (no changes needed)
- **ML Service**: Connects to the same FastAPI service (no changes needed)
- **Authentication**: Shares Clerk configuration with web app
- **Database**: All user data stored in the same MongoDB database
- **Theme**: Automatic light/dark mode based on device settings
- **Platform**: Works on both iOS and Android with single codebase

## 🤝 Contributing

This mobile app complements the existing web application. When adding features:
1. Ensure backend API compatibility
2. Follow the same authentication flow
3. Maintain consistency with web app UX
4. Test on both iOS and Android

## 📄 License

Same as the main project.
