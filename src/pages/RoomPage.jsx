import Chatbox from "../components/Chatbox";

function RoomPage(){
    return(
        <div className="room-container">
            <div className="left-panel">
                <section>
                    <h2>Room Information</h2>
                    <p>Room Name</p>
                    <p>Description</p>
                    <p>Capacity</p>
                </section>

                <section>
                    <h2>Users Currently in Room</h2>
                    <ul>
                        <li>User 1</li>
                        <li>User 2</li>
                        <li>User 3</li>
                    </ul>
                </section>

                <section>
                    <h2>Study Timer</h2>
                    <button className=""></button>
                </section>
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

export default RoomPage;