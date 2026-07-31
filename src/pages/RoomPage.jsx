import {useNavigate, useParams} from "react-router";
import Chatbox from "../components/Chatbox";
import { useState } from "react";

function RoomPage(){
    const navigate = useNavigate()
    const {id: roomId} = useParams();

    const handleLeaveRoom = () => {
        const confirmed = window.confirm("Do you wish to leave this room?");
            if(confirmed){
                navigate("/") // This navigates to the home page.
            }
    };


    return(
        <div className="room-container">
            <div className="left-panel">
                <div className="left-panel-header">
                    <h2>Room Information</h2>
                    <button type="Button" className="leave-room-btn" onClick={handleLeaveRoom}>Leave Room</button>
                </div>

                <section>
                    <p>Room Name</p>
                    <p>Description</p>
                    <p>Capacity</p>
                </section>

                <section>
                    <h2>Users Currently in Room</h2>

                </section>
            </div>
            
            <div className="right-panel">
                <h2>Chat</h2>

                <div className="chat-messages">
                    <p>User 1: Ready to Study?</p>
                    <p>User 2: Yeah</p>
                </div>
                <Chatbox roomId={roomId}/>

                <input
                type="text"
                placeholder="Type your message..." 
                />

                <button>Send</button>
            </div>
        </div>
    )
}  

export default RoomPage;