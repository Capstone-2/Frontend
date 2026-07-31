import { useNavigate, useParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import Chatbox from "../components/Chatbox";
import { useState, useEffect } from "react";

function RoomPage() {
    const navigate = useNavigate();
    const params = useParams()
    const roomId = Number(params.id);
    const [room, setRoom] = useState({})
    const { user } = useAuth0();

    const handleLeaveRoom = () => {
        const confirmed = window.confirm("Do you wish to leave this room?");
        if (confirmed) {
            navigate("/")
        }
    };

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

    return (
        <div className="room-page">
            <div className="room-topbar">
                <div className="room-topbar-title">
                    <span className="room-status-dot"/>
                    <span className="room-title">Room {roomId}</span>
                </div>
                <button type="button" className="leave-room-btn" 
                onClick={handleLeaveRoom}>Leave Room</button>
            </div>

            <div className="room-main">
                <div className="room-content">
                    <div className="room-content">
                        Room content placed here
                    </div>
                </div>
                
                <div className="room-chat-panel">
                    <Chatbox roomId={roomId}/>
                </div>
            </div>
            
            <div className="right-panel">
                <h2>Chat</h2>

                <div className="chat-messages">
                    <p>User 1: Ready to Study?</p>
                    <p>User 2: Yeah</p>
                </div>

                <input
                type="text"
                placeholder="Type your message..." 
                />

                <button>Send</button>
            </div>
        </div>
    );
}
export default RoomPage