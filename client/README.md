# Cattle Breed Recognition - Frontend Client

React frontend for the Cattle Breed Recognition system.

## Stack

- React 19 with Vite
- Tailwind CSS 4
- Clerk authentication
- Recharts for analytics
- Axios for API

## Features

- Image upload & camera capture
- Real-time breed prediction
- Species detection (cattle/buffalo)
- 41 breeds supported
- User dashboard with statistics
- Prediction history
- Analytics with charts
- Breed map visualization
- PDF export

## Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5002/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Pages

- `/` - Home/upload page
- `/login` - Sign in
- `/register` - Sign up
- `/dashboard` - User dashboard
- `/history` - Prediction history
- `/analytics` - Analytics charts
- `/breeds` - Breed database
- `/settings` - User settings

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/         # Button, Card, Input, Modal, etc.
│   │   └── layout/     # Dashboard, Sidebar, Navigation
│   ├── pages/           # Page components
│   ├── services/       # API client
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```