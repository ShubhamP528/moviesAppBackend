# 🎬 Theator - Real-Time Cinematic Synchrony

![Theator Logo](file:///C:/Users/HP/.gemini/antigravity/brain/df1d4255-98f5-43df-970b-f4283429590e/theator_logo_concept_1774094591920.png)

**Theator** is a high-performance backend solution designed to power real-time movie watch parties. Built with **Node.js**, **Express**, and **Socket.io**, it enables users to synchronize video playback effortlessly across multiple clients, providing a seamless "theater-at-home" experience.

---

## 🌟 Key Features

- 🔄 **Real-Time Synchronization**: Instant sync for play, pause, seek, and playback speed adjustments across all participants in a room.
- 💬 **Interactive Chat**: Built-in messaging system for real-time communication during movies.
- 🔐 **Multi-Layered Authentication**: 
  - Standard JWT-based Login/Signup with password hashing (Bcrypt).
  - One-tap **Google OAuth 2.0** integration for quick access.
- 🏢 **Room Management**: Dynamic creation and joining of rooms with persistent session states.
- 👥 **Host Handover**: Automatic assignment of a new host if the current host disconnects.
- 📈 **User Tracking**: Live user count tracking within each room.
- 📱 **Session Persistence**: Saves video state and playback progress in MongoDB.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Real-time Engine**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Security**: [Passport.js](https://www.passportjs.org/), [JWT](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Deployment Ready**: Configured for [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas instance)
- Google Cloud Console Project (for Google Auth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory (refer to `.env.example`).

---

## ⚙️ Environment Variables

Required variables in your `.env` file:

| Variable | Description |
| :--- | :--- |
| `DB_URL` | Your MongoDB connection string |
| `SECRET` | JWT Secret key for authentication |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `PORT` | Port number (default: 8080) |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/googleAuth` - Handle Google OAuth flow

### Room Operations
- `GET /api/room` - Retrieve room details
- `POST /api/getVideoId` - Get current video ID for a session

### System
- `GET /getTotalUser` - Get total active users across all sessions
- `GET /api/hii` - Health check endpoint

---

## 🔌 Socket Events

The backend handles the following WebSocket events for synchronization:

- `joinRoom`: Participant joins a specific room namespace.
- `newuser`: Initializes session state for a new participant.
- `play` / `pause`: Synchronizes playback controls across the room.
- `seek`: Updates playback time for all users.
- `changePlaybackSpeed`: Adjusts the playback rate.
- `chatMessage`: Forwards messages to all participants in the room.

---

## 🛡️ License

This project is licensed under the **ISC License**.

---

<p align="center">Made with ❤️ for movie lovers everywhere.</p>
