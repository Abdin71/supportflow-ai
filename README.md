# SupportFlow AI

An AI-powered ticketing system for customer support with real-time updates, automated categorization, and intelligent response suggestions.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS v4, shadcn/ui
- **State Management**: Zustand with persistence
- **Backend**: Firebase Cloud Functions (Node.js 20)
- **Database**: Cloud Firestore (real-time)
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-4 API integration
- **Deployment**: Firebase Hosting + Cloud Functions

## 📦 Project Structure

```
supportflow-ai/
├── backend/                       # Cloud Functions & Serverless Backend
│   ├── src/
│   │   └── index.ts              # Cloud Functions (helloWorld, addMessage, etc.)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                      # React Applications
│   ├── user-interface/           # Customer-facing portal
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.ts
│   └── admin-dashboard/          # Agent/Admin interface
│       ├── src/
│       ├── package.json
│       └── next.config.ts
├── shared/                       # Shared utilities & configurations
│   ├── config/
│   │   └── firebase.ts          # Firebase initialization
│   ├── lib/
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── firestore.ts         # Firestore CRUD operations
│   │   ├── cloudFunctions.ts    # Cloud Functions client
│   │   └── index.ts             # Export barrel
│   ├── types/
│   │   └── index.ts             # Shared TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── _demo/                        # Archived Next.js demo
├── .env.local                    # Environment variables
├── firebase.json                 # Firebase configuration
└── package.json                  # Root workspace config
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ installed
- npm package manager
- Firebase account with project created
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abdin71/supportflow-ai.git
   cd supportflow-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.local.example` to `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Development

**Start all services:**

```bash
# Terminal 1: Admin Dashboard
npm run dev:admin

# Terminal 2: User Interface
npm run dev:user

# Terminal 3: Backend Functions (local)
npm run dev:backend
```

**Individual workspace commands:**

```bash
# User Interface (Customer Portal)
npm run dev:user          # Dev server
npm run build:user        # Production build

# Admin Dashboard (Agent Interface)
npm run dev:admin         # Dev server
npm run build:admin       # Production build

# Backend (Cloud Functions)
npm run dev:backend       # Local emulator
npm run build:backend     # Build functions
```

### Deployment

**Deploy everything:**
```bash
npm run deploy
```

**Deploy specific services:**
```bash
firebase deploy --only functions      # Backend only
firebase deploy --only hosting        # Frontend only
```

## 🔥 Features

### User Interface (Customer Portal)
- Submit support tickets with subject and description
- View ticket history and status
- Real-time updates on ticket responses
- Track ticket resolution progress

### Admin Dashboard (Agent Interface)
- View and manage all support tickets
- Filter tickets by status (Open, In Progress, Resolved)
- Assign tickets to agents
- AI-powered response suggestions
- Real-time ticket updates
- Change ticket status and priority

### Backend Services
- **AI Categorization**: Automatic ticket classification using GPT-4
- **Smart Tagging**: AI-generated tags for better organization
- **Quick Replies**: AI-suggested responses to speed up support
- **Real-time Sync**: Firestore listeners for instant updates
- **Secure Authentication**: Firebase Auth with role-based access

## 🏗️ Architecture

This project uses a **monorepo structure** with npm workspaces:

- **Shared Module**: Common utilities, Firebase config, and TypeScript types
- **Frontend Apps**: Separate Next.js apps for users and agents
- **Backend**: Firebase Cloud Functions for serverless logic

### Key Technologies

- **Monorepo**: npm workspaces for multi-package management
- **TypeScript**: End-to-end type safety
- **Real-time Database**: Firestore with live listeners
- **Serverless Functions**: Node.js 20 on Firebase Cloud Functions
- **Modern React**: Next.js 15 with App Router
- **Component Library**: shadcn/ui with Radix UI primitives

## 📚 Documentation

- [`RESTRUCTURING.md`](RESTRUCTURING.md) - Project restructuring guide
- [`shared/README.md`](shared/README.md) - Shared module documentation
- [`supportflowai.md`](supportflowai.md) - Complete requirements and design docs

## 🔧 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication, Firestore, and Cloud Functions

2. **Configure Hosting Targets**
   ```bash
   firebase target:apply hosting user-interface your-user-site
   firebase target:apply hosting admin-dashboard your-admin-site
   ```

3. **Deploy Cloud Functions**
   ```bash
   cd backend
   npm run build
   firebase deploy --only functions
   ```

## 🤝 Contributing

This is an MVP project. Contributions are welcome for:
- Bug fixes
- Performance improvements
- Documentation updates
- New features (aligned with roadmap)

## 📄 License

[MIT License](LICENSE)

## 🔗 Links

- **Repository**: [github.com/Abdin71/supportflow-ai](https://github.com/Abdin71/supportflow-ai)
- **Firebase**: [firebase.google.com](https://firebase.google.com)
- **Next.js**: [nextjs.org](https://nextjs.org)

---

**Built with** ❤️ **using Next.js, Firebase, and OpenAI**
