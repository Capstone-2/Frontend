import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import Chatbox from "../components/Chatbox";
import { startSession, endSession } from "../api/sessions";
import { getRoom } from "../api/rooms";
import { useCurrentUser } from "../context/CurrentUserContext";
import { socket } from "../api/socket";

function RoomPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const params = useParams()
  const roomId = Number(params.id);
  const [room, setRoom] = useState({})
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomError, setRoomError] = useState("");
  const [isRoomLoading, setIsRoomLoading] = useState(true);
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [sessionId, setSessionId] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentRoomUser = roomUsers.find((roomUser) => Number(roomUser.userId) === Number(currentUser?.id));
  const currentStudySession = currentRoomUser?.studySession;
  const activeSessionId = currentStudySession?.id || sessionId;

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
    if (!activeSessionId) { return }
    setSessionError("");
    setIsLoading(true);
    try {
      await endSession(activeSessionId);
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

  function getDisplayName(roomUser) {
    return roomUser.displayName || roomUser.username || `User ${roomUser.userId}`;
  }

  function isCurrentUser(roomUser) {
    return Number(roomUser.userId) === Number(currentUser?.id);
  }

  function getInitials(roomUser) {
    const displayName = getDisplayName(roomUser);
    return displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  }

  function getParticipantColumns(userCount) {
    if (userCount <= 4) return 2
    if (userCount <= 6) return 3;
    return 4;
  }

  function formatStudyTime(startedAt, currentTime) {
    if (!startedAt) {
      return null;
    }

    const startedTime = new Date(startedAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((currentTime - startedTime) / 1000));
    const hours = Math.floor(elapsedSeconds / 3600);

    const minutes =Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2,"0"))
      .join(":");
  }

  useEffect(() => {
    let active = true;
    async function fetchRoom() {
      setRoomError("");
      setIsRoomLoading(true);

      try {
        const data = await getRoom(roomId);
        if (active) setRoom(data);
      } catch (error) {
        if (active) setRoomError(error.message);
      } finally {
        if (active) setIsRoomLoading(false);
      }
    }

    if (Number.isInteger(roomId) && roomId > 0) {
      fetchRoom();
    } else {
      setRoomError("Invalid room ID.");
      setIsRoomLoading(false);
    }

    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    const someoneIsStudying = roomUsers.some((roomUser) => roomUser.studySession?.startedAt);
    if (!someoneIsStudying) {
      return;
    }

    const intervalId = window.setInterval(() => {setCurrentTime(Date.now())}, 1000);
    return () => {window.clearInterval(intervalId)};
  }, [roomUsers]);

  // Room Capacity checker.
  useEffect(() => {
    let active = true;

    async function checkCapacity() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/presence`);
        if (!response.ok) {
          throw new Error("Could not check room capacity.");
        }

        const presence = await response.json();
        if (!active) {
          return;
        }

        const currentUserIsPresent = presence.users.some((roomUser) => Number(roomUser.userId) === Number(currentUser?.id));
        const roomIsFull = presence.count >= Number(room?.capacity);

        if (roomIsFull && !currentUserIsPresent) {
          window.alert("This room has reached its maximum capacity.");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Capacity check failed:", error.message);
      } finally {
        if (active) {
          setIsCheckingCapacity(false);
        }
      }
    }

    if (room?.capacity && currentUser) {
      checkCapacity();
    }

    return () => {
      active = false;
    };
  }, [roomId, room?.capacity, currentUser, navigate]);

  // Handling a full room.
  useEffect(() => {
    function handleRoomFull(details) {
      setRoomError(details?.error || "This room is full.");
      window.alert(details?.error || "This room is full.");
      navigate("/");
    }
    
    socket.on("room-full", handleRoomFull);
    return () => {
      socket.off("room-full", handleRoomFull);
    };
  }, [navigate]);

  if (isRoomLoading || isCheckingCapacity) {
    return (
      <div className="room-loading">
        Checking room availability...
      </div>
    );
  }

  return (
    <div className="room-page">
      <header className="room-topbar">
        <div className="room-topbar-title">
          <span className="room-status-dot" />

          <span className="room-title">
            {isRoomLoading
              ? "Loading room..."
              : room?.name || `Room ${roomId}`}
          </span>

          <span className="occupancy-badge">
            {roomUsers.length} / {room?.capacity ?? "?"} Studying
          </span>
        </div>

        <button
          type="button"
          className="leave-room-btn"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </header>

      {roomError && (
        <p role="alert" className="room-error">
          {roomError}
        </p>
      )}

      {sessionError && (
        <p role="alert" className="session-error">
          {sessionError}
        </p>
      )}

      <div className="room-workspace">
        <section className="room-stage">
          <div className="participant-panel">
            <div className="section-heading-row">
              <h2>Study room</h2>

              <span className="participant-count">
                {roomUsers.length} Active User{roomUsers.length > 1 ? "s": ""}
              </span>
            </div>

            <div className="participant-grid" style={{"--participant-columns": getParticipantColumns(roomUsers.length)}}>
              {roomUsers.length === 0 ? (
                <div className="empty-participants">
                  Waiting for participants...
                </div>
              ) : (
                roomUsers.map((roomUser) => (
                  <article
                    key={roomUser.userId}
                    className={
                      isCurrentUser(roomUser)
                        ? "participant-tile is-current-user"
                        : "participant-tile"
                    }
                  >
                    <div className="participant-avatar">
                      {roomUser.icon ? (
                        <img
                          src={roomUser.icon}
                          alt=""
                          className="participant-avatar-image"
                        />
                      ) : (
                        <span>{getInitials(roomUser)}</span>
                      )}
                    </div>

                    <div className="participant-details">
                      <span className="participant-name">
                        {getDisplayName(roomUser)}
                      </span>

                      {isCurrentUser(roomUser) && (
                        <span className="you-badge">
                          You
                        </span>
                      )}
                    </div>

                    {roomUser.studySession && (
                      <span className="participant-study-timer">
                        Studying{" "}{formatStudyTime(roomUser.studySession.startedAt, currentTime)}
                      </span>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="room-info-strip">
            <div className="room-info-copy">
              <h2>Room info</h2>

              <p>
                {isRoomLoading
                  ? "Loading room information..."
                  : room?.description ||
                    "No description is available for this room."}
              </p>
            </div>

            <div className="study-control">
              {currentStudySession || sessionId ? (
                <button
                  type="button"
                  className="session-btn end-session-btn"
                  onClick={handleEndSession}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Ending..."
                    : "End Study Session"}
                </button>
              ) : (
                <button
                  type="button"
                  className="session-btn start-session-btn"
                  onClick={handleStartSession}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Starting..."
                    : "Start Study Session"}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="room-chat-panel">
          <div className="room-chat-heading">
            <h2>Chat</h2>
          </div>

          <Chatbox
            roomId={roomId}
            onRoomUsersChange={setRoomUsers}
          />
        </aside>
      </div>
    </div>
  );
}

export default RoomPage;