import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import Chatbox from "../components/Chatbox";
import { startSession, endSession } from "../api/sessions";
import { useCamera } from "../hooks/useCamera";
import { useWebRTC } from "../hooks/useWebRTC";
import { useCurrentUser } from "../context/CurrentUserContext";

function RoomPage() {
  const navigate = useNavigate();
  // const { user } = useAuth0();
  const { user: auth0User } = useAuth0();
const { user: currentUser } = useCurrentUser();
  const params = useParams()
  const roomId = Number(params.id);
  const [room, setRoom] = useState({})

  const [sessionId, setSessionId] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { localStream, error: error, turnOnCamera, turnOffCamera } = useCamera();
  const { remoteStreams } = useWebRTC(localStream, currentUser?.id);

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
    
    useEffect(() => {
        async function fetchRoom() {
            try {
                const allRooms = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    return setRoom(data);
                });
            } catch (error) {
                console.error("Error fetching rooms", error);
                setError(error.message);
            }
        }
        fetchRoom();
    }, [])
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
          <Chatbox roomId={roomId}/>
        </div>
      </div>


   <div>
  <button onClick={turnOnCamera}>Turn on camera</button>
  <button onClick={turnOffCamera}>Turn off camera</button>
  {error && <p>{error}</p>}

  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    {localStream && (
      <video
        autoPlay
        muted
        ref={(video) => {
          if (video) video.srcObject = localStream;
        }}
        style={{ width: 200 }}
      />
    )}

    {Object.entries(remoteStreams).map(([peerUserId, stream]) => (
      <video
        key={peerUserId}
        autoPlay
        ref={(video) => {
          if (video) video.srcObject = stream;
        }}
        style={{ width: 200 }}
      />
    ))}
  </div>
</div>

    </div>
  );
}

export default RoomPage;