import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/* link: won't reload the page, <a>tag will reload
useNavigate: manually redirect user to other pages
useEffect: a function to load once */

const navigete = useNavigate();

export default function AllRooms() {
  //state
  //React re-renders the page every time any of these change.
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [password, setPassword] = useState("0000");
  const [error, serError] = useState(null);

  //   const navigate = useNavigate();

  //load all rooms
  //runs when "all rooms" button clicked
  //same route you test at POSTMAN
  useEffect(() => {
    async function fetchRooms() {
      try {
        console.log("path:", `${import.meta.env.VITE_API_URL}/rooms`);
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

  return (
    <div>
      <h1>All Rooms</h1>
      <div className="rooms">
        {rooms.length === 0 ? (
          <p>No rooms available yet.</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-card">
              <img
                src={room.image || "/default.jpg"}
                alt={room.name}
                className="room-image"
              />

              <h2 onClick={() => navigate(`/rooms/${room.id}`)}>{room.name}</h2>
              <p>{room.description}</p>
              {/* <div>
                <button onClick={() => navigate(`/rooms/${room.id}`)}>
                  Join
                </button> 
              </div>*/}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
