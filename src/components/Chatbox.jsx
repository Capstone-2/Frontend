// components/Chatbox.jsx — live chat for a study room.
// Expects roomId, userId, displayName as props from whoever builds RoomPage.
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { socket } from "../api/socket";
import { getRoomMessages } from "../api/rooms";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function Chatbox({ roomId, onRoomUsersChange }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [socketError, setSocketError] = useState("");
  const {user} = useCurrentUser();
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const {
    isAuthenticated: isAuth0User,
    isLoading: isAuth0Loading,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    if (!user || isAuth0Loading) { return }
    
    let canceled = false;

    function handleConnect() {
      console.log("Socket connected:", socket.id);
      console.log("Joining Room:", roomId)
      socket.emit("join-room", { roomId }); // userId & displayName no longer need to be sent!
    }

    function handleReceivedMessage(msg) {
      console.log("Received message:", msg);

      setMessages((prev) => {
        const alreadyExists = prev.some((existingMsg) => existingMsg.id === msg.id);
        if (alreadyExists) {
          return prev;
        }

        return [...prev, msg];
      })
    }

    function handleConnectError(error) {
      console.error("Socket connection failed:", error.message)
      setSocketError(error.message)
    }

    function handleChatError(error) {
      console.error("Chat error:", error);
    }
    
    function handleRoomUsers(users) {
      onRoomUsersChange?.(users);
    }

    function handleSystemMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }

    async function connectAuthenticatedSocket() {
      try {
        let token = null;
        if (isAuth0User) {
          token = await getAccessTokenSilently();
        }

        if (canceled) {
          return
        }

        setIsLoadingHistory(true);

        try {
          const chatHistory = await getRoomMessages(roomId, token);
          if (!canceled) {
            const normalizedHistory = chatHistory.map(normalizeHistoryMessage);
            setMessages(normalizedHistory);
          }
        } catch (error) {
          console.error("Could not load chat history:", error.message);
          if (!canceled) {
            setSocketError("Live chat is available, but previous messages could not be loaded.");
          }
        } finally {
          if (!canceled) {
            setIsLoadingHistory(false);
          }
        }

        if (canceled) {
          return;
        }

        // Add auth token to socket
        socket.auth = token ? {token} : {};

        // Add event listeners
        socket.on("chat-error", handleChatError);
        socket.on("connect", handleConnect)
        socket.on("receive-message", handleReceivedMessage)
        socket.on("room-users", handleRoomUsers);
        socket.on("system-message", handleSystemMessage);
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
      socket.off("receive-message", handleReceivedMessage);
      socket.off("room-users", handleRoomUsers);
      socket.off("system-message", handleSystemMessage);
      socket.off("chat-error", handleChatError);
      socket.off("connect_error", handleConnectError)
      socket.disconnect();
    };
  }, [roomId, user, isAuth0User, isAuth0Loading, getAccessTokenSilently, onRoomUsersChange]);

  function normalizeHistoryMessage(message) {
    return {
      id: message.id,
      userId: message.userId,
      roomId: message.roomId,
      displayName: message.User?.displayName || message.User?.username || "Unknown user",
      text: message.text,
      sentAt: message.createdAt,
    };
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const cleanText = draft.trim()
    console.log("Sending message:", cleanText);
    socket.emit("send-message", { text: cleanText });
    setDraft("");
  }

  return (
    <div className='chatbox'>
      <div className='chatbox-messages'>
        {isLoadingHistory ? (
          <p className="chat-empty-message"> Loading messages... </p>
        ) : messages.length === 0 ? (
          <p className="chat-empty-message"> No messages yet — say hi. </p>
        ) : null}
        {messages.map((message) => message.type === "system" ? (
            <p key={message.id} className="chat-empty-message">
              {message.text}
            </p>
          ) : (
            <p key={message.id} className="text-sm">
              <strong> {message.displayName}: </strong>{" "} {message.text}
            </p>
          )
        )}
      </div>

      {socketError && (
        <p className="chat-error">
          {socketError}
        </p>
      )}

      <div className='chatbox-input-row'>
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
