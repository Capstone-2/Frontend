import { useNavigate } from "react-router";
import Chatbox from "../components/Chatbox";
import { useState } from "react";

function RoomPage(){
    const navigate = useNavigate();


    const handleLeaveRoom = () => {
        const confirmed = window.confirm("Do you wish to leave this room?");
            if(confirmed){
                navigate("/AllRoomsPage")
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
        </div>
    )
}  

export default RoomPage;