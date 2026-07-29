// components/Chatbox.jsx — live chat for a study room.
// Expects roomId, userId, displayName as props from whoever builds RoomPage.
import { useEffect, useState } from "react";
import { socket } from "../api/socket";

export default function Chatbox({ roomId, userId, displayName }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", { roomId, userId, displayName });

    function onReceiveMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on("receive-message", onReceiveMessage);

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("receive-message", onReceiveMessage);
      socket.disconnect();
    };
  }, [roomId]);

  function sendMessage() {
    if (!draft.trim()) return;
    socket.emit("send-message", { roomId, text: draft });
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