# Study Room

Study Room is full-stack, real-time study platform where students can create and join virtual study rooms, communicate through live chat, track focused study sessions, and view community study rankings.

It was developed as a team capstone project to practice building a complete PERN-stack application while introducing more advanced technologies such as Authentication and Socket.IO.

## Live Demo

| Environment | URL |
| --- | --- |
| Frontend (Vercel) | [Study Room App](https://study-room-app-liard.vercel.app/) |
| Backend API (Render) | [Backend API](https://backend-nlnv.onrender.com/) |

## Repo Links
| Repository | URL |
| --- | --- |
| Frontend | https://github.com/Capstone-2/Frontend |
| Backend | https://github.com/Capstone-2/Backend |

## Features

### Accounts and Profiles

- **[X]** Create an account using a username, email, and password
- **[X]** Sign in normally or through Auth0 social authentication
- **[X]** Restores authenticated sessions after refreshing the page
- **[X]** Log out from local or Auth0 accounts
- **[X]** Edit the current user's display name and school
- **[X]** Protect profile, room creation, and study-room routes
- **[X]** Store local passwords as bcrypt hashes rather than the password itself.
- **[X]** Store local auth tokens in HttpOnly cookies

### Study Rooms

- **[X]** View all available study rooms
- **[X]** View live room occupancy from the rooms page
- **[X]** Create a room with a title, description, and set a capacity
- **[X]** View room info and the room creator
- **[X]** Prevent users from joining rooms that have reached max capacity
- **[X]** Update participant layouts based on the number of connected users
- **[X]** Display live join and leave notifications

### Live Chat

- **[X]** Send and receive messages without refreshing the page
- **[X]** Broadcast new messages to everyone currently in the room
- **[X]** Persist chat message history in PostgreSQL
- **[X]** Load recent message history when entering a room
- **[X]** Associate messages with authenticated users and rooms
- **[X]** Remove the oldest saved messages after a room reaches its history limit

### Study Tracking

- **[X]** Start and stop focused study sessions
- **[X]** Record session start time, end time, and duration
- **[X]** Calculate total session time, and add it to each user's total study time
- **[X]** Display a live timer for every actively studying participant
- **[X]** Synchronize active study-session state across connected browsers
- **[X]** Restore an active timer after refreshing the room
- **[X]** Prevent a user from starting multiple simultaneous sessions

### Community

- **[X]** View public user profiles
- **[X]** Rank users by total saved study time
- **[X]** Display 1st, 2nd, and 3rd rank badges for the top users.
- **[X]** Identify the logged-in user on the leaderboard

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Socket.IO Client, Auth0 React SDK, Tailwind CSS, CSS |
| Backend | Node.js, Express, Socket.IO |
| Authentication | Auth0, JSON Web Tokens, HttpOnly cookies, bcrypt |
| Database | PostgreSQL, Sequelize (ORM) |
| Security | Helmet, CORS, Express Rate Limit |
| Hosting | Vercel (Frontend), Render (Backend), Neon (Database) |

## Architecture

The React frontend communicates with the Express backend through two systems:

1. **REST API requests** are used for operations such as authentication, loading rooms, creating rooms, updating profiles, loading message history, and starting or stopping study sessions.
2. **Socket.IO events** are used for real-time room activity such as live chat, participants, join and leave notifications, room-capacity enforcement, and syncing study-session statuses.

The Express server validates authenticated HTTP requests and Socket.IO connections before resolving them to a user in the local database. Sequelize is used to read and update the PostgreSQL database.

## Authentication

Study Room supports two authentication methods.

### Local Authentication

Users can create an account using a username, email address, and password. Passwords are hashed with bcrypt before being stored in PostgreSQL.

After a signup or login, the backend creates a signed JWT and stores it in an HttpOnly cookie. Because JavaScript cannot directly read the token, it's less exposed to theft through client-side scripts. The browser automatically includes it within authenticated requests.

### Auth0 Authentication

Users may also sign in through Auth0. The frontend receives an Auth0 access token and sends it as a Bearer token to protected backend routes.

On the user's first Auth0 login, the backend creates a matching row in the local Users table. Later logins reuse that existing database user.

### Shared Authorization

Protected routes use a shared authentication middleware that accepts either:

- The application's JWT cookie
- A valid Auth0 Bearer access token

Both methods ultimately resolve to the same local user record, allowing the rest of the application to still use one consistent user model.

## Real-Time Communication

Each authenticated browser creates its own Socket.IO connection when entering a study room. The backend authenticates the connection and stores the resolved local user on the socket.

When the client emits `join-room`, the server validates the room, checks its current capacity, and adds the socket to a Socket.IO room named after the database room ID.

For example:

```text
Database room ID: 3
Socket.IO room:   room-3
```

All clients joined to room-3 can then receive real-time events for:

* New chat messages
* Updated participant lists
* Join and leave notifications
* Room-capacity errors
* Active study-session changes

The server does not broadcast a new timer value every second. Instead, it broadcasts each session's `startedAt` timestamp, and every connected browser calculates the visible elapsed time locally.

## Database Schema

| Table | Key Columns | Relationships |
| --- | --- | --- |
| Users | `id`, `auth0Id`, `username`, `displayName`, `email`, `passwordHash`, `school`, `icon`, `totalStudyTime` | Has many Rooms, Sessions, and Messages |
| Rooms | `id`, `adminUserId`, `name`, `description`, `image`, `capacity`, `password`, `is_default` | Belongs to an admin User; has many Sessions and Messages |
| Sessions | `id`, `userId`, `roomId`, `startedAt`, `endedAt`, `durationSeconds` | Belongs to one User and one Room |
| Messages | `id`, `userId`, `roomId`, `text`, `createdAt` | Belongs to one User and one Room |

A room's `adminUserId` may be null so that the application can include permanent default rooms. 

Sessions act as historical records of a user's focused time in a room. Messages remain associated with the user who sent them and the room in which they were sent.

## API Reference
Protected routes accept either the application's authentication cookie or an Auth0 access token:

```http
Authorization: Bearer <auth0-access-token>
```
Local users are authenticated automatically through the HttpOnly cookie.

### Authentication
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Creates a local account and set an authentication cookie |
| POST | `/auth/login` | Log in using an email address or username |
| POST | `/auth/auth0` | Create or retrieve a local database user from an Auth0 identity |
| GET | `/auth/me` | Return the currently authenticated user |
| POST | `/auth/logout` | Clear the local authentication cookie|

### Users
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users` | Returns public profile and study-time info for all users |
| GET | `/users/:id` | Returns one user's public profile |
| GET | `/users/me` | Returns the authenticated user's private profile  |
| PATCH | `/users/me` | Update the authenticated user's fields (displayName or School) |
| DELETE | `/users/me` | Delete the authenticated user's account |

### Rooms
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/rooms` | Return all rooms without exposing room passwords |
| GET | `/rooms/presence` | Returns current Socket.IO occupancy for all rooms |
| GET | `/rooms/:id` | Returns one room and its admin info |
| GET | `/rooms/:id/messages` | Returns chat message history for a single room |
| POST | `/rooms` | Create a room for the authenticated user |
| PATCH | `/rooms/:id` | Updates a room owned by the authenticated user |
| DELETE | `/rooms/:id` | Delete a room owned by the authenticated user |

### Sessions
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/sessions` | Begin a study session in a room |
| PATCH | `/sessions/:id/end` | End an active study session and calculate its total duration |

## Socket.IO Event Reference

### Client to Server

| Event | Data | Description |
| --- | --- | --- |
| `join-room` | `{ roomId }` | Request to join a study room |
| `leave-room` | None | Leave the current room |
| `send-message` | `{ text }` | Send a new chat message |

### Server to Client

| Event | Data | Description |
| --- | --- | --- |
| `receive-message` | Message object | Broadcasts a saved chat message to the entire room |
| `room-users` | Array of participant objects | Sync's room presence and active study sessions |
| `system-message` | System message object | Announces when a user joins or leaves a room |
| `user-joined` | User summary | Notifies other clients that a participant joined |
| `user-left` | User summary | Notifies other clients that a participant left |
| `room-full` | Capacity information | Rejects a connection when the room is at capacity |
| `chat-error` | Error object | Reports invalid room or message activity |

## Getting Started (Run it Locally)

### Prerequisites
- Node.js and npm
- A PostgreSQL database
- An Auth0 account with a Single Page Application and API configured

### 1. Clone the repositories
```bash
git clone https://github.com/Capstone-2/Backend.git
git clone https://github.com/Capstone-2/Frontend.git
```

### 2. Configure the backend
```bash
cd Backend
npm install
```

Copy the included environment example:
```bash
cp .env.example .env
```

Open `.env` and provide your PostgreSQL connection, Auth0 configuration, and a secure `JWT_SECRET`.

Start the backend:
```bash
npm run dev
```

By default, the backend runs at:
```text
http://localhost:8080
```

### 3. Configure the frontend

In a second terminal:
```bash
cd Frontend
npm install
```

Copy the included environment example:
```bash
cp .env.example .env
```

Fill in the backend API URL and Auth0 values, then start the application:
```bash
npm run dev
```

The frontend normally runs at:
```text
http://localhost:5173
```

Do not commit either `.env` file. The `.env.example` files document the required variables without exposing real credentials.

## Auth0 Config
Create the following resources in the Auth0 dashboard:
1. A **Single Page Application** for the React frontend.
2. An **API** for the Express backend.

Add the local frontend URL to the application's:

```text
Allowed Callback URLs: http://localhost:5173
Allowed Logout URLs:   http://localhost:5173
Allowed Web Origins:   http://localhost:5173
```

Use the Auth0 values as follows:

| Auth0 value | Environment variable |
| --- | --- |
| Tenant domain | `AUTH0_DOMAIN` and `VITE_AUTH0_DOMAIN` |
| Application client ID | `VITE_AUTH0_CLIENT_ID` |
| API identifier | `AUTH0_AUDIENCE` and `VITE_AUTH0_AUDIENCE` |

Auth0 login also requires a Post Login Action that adds the user's email to the access token:

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://study-room.example.com";

  if (event.user.email) {
    api.accessToken.setCustomClaim(
      `${namespace}/email`,
      event.user.email
    );
  }
};
```

Deploy the Action and add it to the Auth0 Login Flow. The namespace used in the Action must exactly match `AUTH0_CLAIMS_NAMESPACE` in the backend `.env`.

## Team & Roles

| Name | Focused on |
| --- | --- |
| Dylan Reaves | Full-stack auth and real-time integration, including protected routes, authenticated Socket.IO chat, persistent message history, profile functionality, study-session logic, live occupancy and system messages, synchronized study timers, room-capacity logic, final UI polish. |
| Alvin Vasquez | Core database and study-room groundwork, including the initial Users, Sessions, and Messages models and associations, user routes, Create Room and Room Page interfaces, and initial frontend controls for starting & ending study sessions. |
| Yangmei Lu | Room discovery and community-facing features, including the Rooms model, All Rooms page, room images and user icons, the user-list and leaderboard presentation, and related interface styling. |
| Shan Htet San | Real-time communication foundations, including the initial Socket.IO server integration, room join, leave, message, and disconnect handlers, the shared frontend socket client, and the first live Chatbox implementation. |

Roles overlapped throughout development. Much of the app was designed and tested collaboratively, so these descriptions show each member's primary areas of focus.

## Known Limitations

- Room passwords are included in the current data model and creation interface, but password validation and room-access enforcement are not yet implemented.
- The application does not currently include friend requests or private messaging.
- Room admin routes exist in the backend, but room editing and deletion are not yet implemented to the frontend.

## Future Improvements

- Add optional video and audio support to study rooms using WebRTC
- Add friend requests, room invitations, and private study groups
- Add notifications for room invitations, active friends, and completed study goals
- Add personal study-history dashboards with daily, weekly, and monthly progress statistics
- Add automated tests for authentication, REST routes, Socket.IO events, room capacity, and study-session calculations
- Improve reconnection handling so users can recover their room presence and active study session after temporary connection loss