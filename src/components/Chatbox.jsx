// components/Chatbox.jsx — live chat for a study room.
// Expects roomId, userId, displayName as props from whoever builds RoomPage.
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { socket } from "../api/socket";

export default function Chatbox({ roomId, userId, displayName }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [socketError, setSocketError] = useState("");
  const {isAuthenticated, isLoading, getAccessTokenSilently} = useAuth0();

  useEffect(() => {
    if (isLoading || !isAuthenticated) { return }
    
    let canceled = false;

    function handleConnect() {
      console.log("Socket connected:", socket.id);
      console.log("Joining Room:", roomId)
      socket.emit("join-room", { roomId }); // userId & displayName no longer need to be sent!
    }

    function handleRecievedMessage(msg) {
      console.log("Received message:", msg);
      setMessages((prev) => [...prev, msg])
    }

    function handleConnectError(error) {
      console.error("Socket connection failed:", error.message)
      setSocketError(error.message)
    }

    function handleChatError(error) {
      console.error("Chat error:", error);
    }

    async function connectAuthenticatedSocket() {
      try {
        const token = await getAccessTokenSilently()
        if (canceled) {
          return
        }

        // Add auth token to socket
        socket.auth = { token: token }

        // Add event listeners
        socket.on("chat-error", handleChatError);
        socket.on("connect", handleConnect)
        socket.on("receive-message", handleRecievedMessage)
        socket.on("connect_error", handleConnectError)

        socket.connect()  // Start authenticated connection

      } catch(error) {
        console.error("Could not get socket token:", error.message)
        setSocketError("Could not authenticate chat.")
      }
    }

    connectAuthenticatedSocket()

    return () => {
      canceled = true
      if (socket.connected) {
        socket.emit("leave-room")
      }

      socket.off("connect", handleConnect);
      socket.off("receive-message", handleRecievedMessage);
      socket.off("chat-error", handleChatError);
      socket.off("connect_error", handleConnectError)
      socket.disconnect();
    };
  }, [roomId, isAuthenticated, isLoading, getAccessTokenSilently]);

  function sendMessage() {
    if (!draft.trim()) return;
    const cleanText = draft.trim()
    console.log("Sending message:", cleanText);
    socket.emit("send-message", { text: cleanText });
    setDraft("");
  }

  return (
    <div className='mx-auto max-w-md rounded-md border border-(--border) p-4 text-left'>
      <div className='mb-3 max-h-60 space-y-1 overflow-y-auto'>
        {messages.length === 0 && (
          <p className='text-sm text-(--text-h)'>No messages yet — say hi.</p>
        )}
        {messages.map((m, i) => (
          <p key={i} className='text-sm'>
            <strong>{m.displayName}:</strong> {m.text}
          </p>
        ))}
      </div>
      <div className='flex gap-2'>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder='Type a message...'
          className='flex-1 rounded-md border border-(--border) bg-transparent px-3 py-1.5 text-sm outline-none focus:border-(--accent)'
        />
        <button
          onClick={sendMessage}
          className='rounded-md bg-(--accent) px-4 py-1.5 text-sm font-medium text-white hover:bg-(--accent-border)'
        >
          Send
        </button>
      </div>
    </div>
  );
}
