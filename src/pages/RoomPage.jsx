import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import Chatbox from "../components/Chatbox";
import { startSession, endSession } from "../api/sessions";

function RoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuth0();

  const [sessionId, setSessionId] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleStartSession() {
    setSessionError("");
    setIsLoading(true);
    try {
      const session = await startSession(Number(roomId));
      setSessionId(session.id);
    } catch (error) {
      console.error("Failed to start session:", error.message);
      setSessionError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEndSession() {
    if (!sessionId) return;
    setSessionError("");
    setIsLoading(true);
    try {
      await endSession(sessionId);
      setSessionId(null);
    } catch (error) {
      console.error("Failed to end session:", error.message);
      setSessionError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLeaveRoom = () => {
    const confirmed = window.confirm("Do you wish to leave this room?");
    if (confirmed) {
      navigate("/");
    }
  };

  return (
    <div className="room-page">
      <div className="room-topbar">
        <div className="room-topbar-title">
          <span className="room-status-dot" />
          <span className="room-title">Room {roomId}</span>
        </div>
        <button type="button" className="leave-room-btn" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </div>

      {sessionError && (
        <p role="alert" className="session-error">
          {sessionError}
        </p>
      )}

      <div className="room-main">
        <div className="room-content">
          <div className="room-content">
            {sessionId ? (
              <button type="button" onClick={handleEndSession} disabled={isLoading}>
                {isLoading ? "Ending..." : "End Study Session"}
              </button>
            ) : (
              <button type="button" onClick={handleStartSession} disabled={isLoading}>
                {isLoading ? "Starting..." : "Start Study Session"}
              </button>
            )}
          </div>
        </div>

        <div className="room-chat-panel">
          <Chatbox
            roomId={roomId}
            userId={user?.sub}
            displayName={user?.nickname || user?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;