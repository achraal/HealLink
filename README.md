# HealLink

**HealLink** is a mobile-first project (React Native / Expo) paired with a FastAPI backend and MongoDB that helps manage health campaigns, fundraisers (cagnottes), and donations. The mobile app integrates Firebase Authentication, QR scanning, maps, and real-time features via WebSocket.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [WebSocket Usage](#websocket-usage)
- [Data & Seeding](#data--seeding)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## Features ✅

- Create and list health campaigns (vaccination drives, blood drives)
- Create and manage cagnottes (fundraisers)
- Make donations to cagnottes
- QR code generation and scanning
- Maps integration to show campaign locations
- Firebase Authentication (email/password + Google suggested)
- Real-time messaging / events via WebSocket

## Tech Stack 🔧

- Frontend: Expo / React Native (see `frontend/healLink-project`)
  - Expo, React Navigation, Firebase, react-native-maps, QR code libraries
- Backend: FastAPI + Motor (async MongoDB client) (`backend/main.py`)
- Database: MongoDB (local or Atlas)
- Realtime: WebSocket endpoint (`/ws`)

---

## Getting Started 🚀

### Prerequisites

- Node.js (16+ recommended) and npm or Yarn
- Expo CLI (optional but recommended): `npm install -g expo-cli`
- Python 3.10+
- MongoDB (local or Atlas)
- (Optional) A Firebase project (for authentication)

### Backend Setup

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Create a virtual environment and install requirements:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Unix/macOS
source .venv/bin/activate

pip install -r requirements.txt
```

3. Configure MongoDB connection (environment variable):

- `MONGO_DETAILS` - Mongo connection string (default: `mongodb://localhost:27017`)

4. Run the backend:

```bash
# run directly
python main.py
# or use uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend endpoints are served on `http://localhost:8000` by default.

### Frontend Setup (Expo)

1. Install dependencies and start the app:

```bash
cd frontend/healLink-project
npm install
# or
# yarn

# start expo
npm run start
# run on Android
npm run android
# run on iOS
npm run ios
```

2. Firebase settings are read from environment variables (see `src/config/firebaseConfig.js`).

---

## API Documentation 📡

Base URL: `http://localhost:8000`

- GET `/campagnes` — List campaigns
- POST `/campagnes` — Create a campaign (send JSON matching model)

- GET `/cagnottes` — List active cagnottes
- POST `/cagnottes` — Create a cagnotte
- POST `/cagnottes/{cagnotte_id}/don` — Make a donation to a cagnotte
- GET `/dons` — Get recent donations

Example: Create a cagnotte with curl

```bash
curl -X POST http://localhost:8000/cagnottes \
  -H "Content-Type: application/json" \
  -d '{"titre":"Soutien clinique X","objectif":1000}'
```

---

## WebSocket Usage 🔌

Connect to: `ws://<backend-host>:8000/ws`

A simple client example (JavaScript):

```js
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => console.log('connected');
ws.onmessage = (evt) => console.log('message', evt.data);

// The server sends a welcome message with a `userID` string
```

You can send messages to the server; the backend currently demonstrates a small poke-style messaging between clients by sending the recipient's `userID` as content.

---

## Data & Seeding 📂

There is a `data_db/` folder with sample text files that represent sample data exports:

- `dataCagnotte.txt` — sample cagnottes
- `dataCampagne.txt` — sample campagnes
- `dataDon.txt` — sample donations

You can import them into MongoDB manually or extend the backend with a small seeder script.

---

## Environment Variables 🔑

Backend:
- `MONGO_DETAILS` — MongoDB connection string

Frontend (Expo — see `src/config/firebaseConfig.js`):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

Set them using `.env` and `expo-cli` or your preferred secret management.

Sample `.env` (do NOT commit to repo):

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345
EXPO_PUBLIC_FIREBASE_APP_ID=1:12345:web:abcde
```

---

## Development Workflow 🛠️

- Feature branches with clear names (`feature/*`), test locally, then open a PR
- Keep backend contract stable if planning frontend changes: update API docs
- Linting & unit tests: add test suites to backend (pytest) and frontend (Jest / React Native Testing Library) as needed

---

## Troubleshooting ⚠️

- MongoDB connection errors: check `MONGO_DETAILS` and ensure Mongo is accessible from the host
- Expo app not connecting to backend: ensure backend is reachable from the device/emulator (use LAN IP or set tunnels in Expo)
- Firebase auth errors: confirm env variables and Firebase console OAuth settings

---

## Contributing 🧩

Contributions are welcome! Please:

1. Fork the repo
2. Create a branch for your feature/fix
3. Open a PR describing the change

Add tests and keep changes focused.

---

## License & Contact 📬

This project can be licensed under **MIT** (or choose your preferred license).

For questions or contribution discussions, open issues or contact the repository owner.

---

Thank you for using HealLink! 💙

