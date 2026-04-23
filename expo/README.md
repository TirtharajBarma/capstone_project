# Cattle Breed Recognition - Expo Mobile App

React Native mobile app built with Expo for cattle breed identification.

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router (file-based routing)
- Clerk authentication
- Axios API client

## Features

- Camera capture for image upload
- Gallery image selection
- Real-time breed prediction
- Species detection (cattle/buffalo)
- User profile & statistics
- Prediction history
- Analytics charts
- Biometric authentication
- Dark mode support

## Setup

```bash
cd expo
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

## Environment Variables

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://192.168.1.x:5002/api
```

## Screens

| Route | Description |
|-------|-------------|
| `/` | Splash / redirect |
| `/sign-in` | Clerk sign in |
| `/sign-up` | Clerk sign up |
| `(tabs)/` | Tab navigation |
| `(tabs)/scan` | Camera upload |
| `(tabs)/history` | Prediction history |
| `(tabs)/analytics` | Analytics charts |
| `(tabs)/profile` | User profile |
| `/results` | Prediction results |
| `/edit-profile` | Edit profile |
| `/help-support` | Help & support |
| `/privacy-policy` | Privacy policy |

## Scripts

- `npm start` - Start Expo
- `npm run ios` - Run iOS simulator
- `npm run android` - Run Android emulator

## Project Structure

```
expo/
├── app/                    # Expo Router pages
│   ├── (auth)/           # Auth screens
│   ├── (tabs)/          # Tab screens
│   ├── _layout.js       # Root layout
│   └── index.js        # Entry
├── components/            # Reusable components
├── context/             # React contexts
├── api/               # API client
├── constants/          # Endpoints
├── hooks/             # Custom hooks
└── package.json
```