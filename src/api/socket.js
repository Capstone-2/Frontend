// socket.js — one shared Socket.io connection, same role as api/client.js
// but for the real-time layer.
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// autoConnect: false — don't open a socket on every page load, only when
// a user actually enters a room. Chatbox connects/disconnects itself.
export const socket = io(BASE_URL, { autoConnect: false, withCredentials: true });