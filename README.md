# MobileCRM - React + Vite + Firebase

This is a CRM application built with React, Vite, and Firebase.

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Firebase CLI (`npm install -g firebase-tools`)

### Installation
```bash
npm install
```

### Running the Application

1. **Start Firebase Emulators** (with data persistence):
   ```bash
   npm run emulators
   ```

2. **Start Development Server** (in a new terminal):
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

### Firebase Emulators & Data Persistence

By default, Firebase emulators lose all data when stopped. This project is configured for data persistence:

- **First time setup**: Use `npm run emulators` - data will be saved automatically when you stop
- **Resume previous session**: Use `npm run emulators:import` to load your previously saved data

The emulator data is stored in the `./emulator-data` directory. The emulators will:
- **Auth**: Run on port 9098
- **Firestore**: Run on port 8081
- **Storage**: Run on port 9198
- **Emulator UI**: Available at http://127.0.0.1:4001/

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run emulators` - Start Firebase emulators with auto-export
- `npm run emulators:import` - Start emulators with imported data

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
