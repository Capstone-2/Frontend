import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
/* link: won't reload the page, <a>tag will reload
useNavigate: manually redirect user to other pages
useEffect: a function to load once */

export default function AllRooms() {
  //state
  //React re-renders the page every time any of these change.
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [password, setPassword] = useState("0000");
  const [error, setError] = useState(null);
  const [roomPresence, setRoomPresence] = useState({});

  const navigate = useNavigate();

  //load all rooms
  //runs when "all rooms" button clicked
  //same route you test at POSTMAN
  useEffect(() => {
    async function fetchRooms() {
      try {
        // console.log("rooms path:", `${import.meta.env.VITE_API_URL}/rooms`);
        const allRooms = await fetch(`${import.meta.env.VITE_API_URL}/rooms`)
          .then((response) => {
            // console.log("res rooms", response);
            return response.json();
          })
          .then((data) => {
            // console.log("data rooms", data);
            return setRooms(data);
          });
      } catch (error) {
        console.error("Error fetching rooms", error);
        setError(error.message);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchRoomPresence() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/presence`);
        if (!response.ok) {
          throw new Error("Could not load room presence.");
        }

        const data = await response.json();
        const presenceByRoom = Object.fromEntries(data.map((entry) => [entry.roomId,entry.users]));
        if (active) {setRoomPresence(presenceByRoom)}
      } catch (error) {
        console.error("Could not load room presence:", error.message);
      }
    }

    fetchRoomPresence();

    const intervalId = window.setInterval(fetchRoomPresence, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function truncateDesc(description, maxLength = 85) {
    const cleanDescription = description?.trim() || "No description available.";
    if (cleanDescription.length <= maxLength) {
      return cleanDescription;
    }
    return `${cleanDescription.slice(0, maxLength).trimEnd()}...`;
  }

  function handleRoomClick(room, currentUserCount) {
    if (currentUserCount >= room.capacity) {
      window.alert("This room is currently full.");
      return;
    }
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div>
      <header className="rooms-page-header">
        <h1>All Rooms</h1>
        <p> Choose a study room, study with other students, and begin a focused session. </p>
      </header>
      <div className="rooms">
        {rooms.length === 0 ? (
          <p>No rooms available yet.</p>
        ) : (
          rooms.map((room) => {
            const users = roomPresence[room.id] || [];
            const currentUserCount = users.length;
            const isFull = currentUserCount >= room.capacity;
            return (
              <div key={room.id} className="room-card-content">
                <div className="room-card">
                  <img
                    src={room.image || "/default.jpg"}
                    alt={room.name}
                    className="room-image"
                  />

                  <h2 className="room-card-title" title={room.name} onClick={() => handleRoomClick(room, currentUserCount)}>{room.name}</h2>
                  <p className="room-card-description" title={room.description || "No description available."}> {truncateDesc(room.description) || "No description available."} </p>

                  <div className={isFull ? "room-card-occupancy is-full" : "room-card-occupancy"}>
                    {isFull ? 
                      <span className={"presence-dot is-full"}/> 
                      : 
                      <span className={currentUserCount > 0 ? "presence-dot is-active" : "presence-dot"}/>
                    }
                    <span> {isFull ? `Room Full · ${currentUserCount} / ${room.capacity}` : `${currentUserCount} / ${room.capacity} Studying`}
                    </span>
                  </div>
                  {/* <div>
                    <button onClick={() => navigate(`/rooms/${room.id}`)}>
                      Delete
                    </button> 
                  </div>*/}
                </div>

              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
