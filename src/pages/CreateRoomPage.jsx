import { useState } from "react";
import { useNavigate } from "react-router";
import { createRoom } from "../api/rooms";
import { useAuth0 } from "@auth0/auth0-react";
import { useCurrentUser } from "../context/CurrentUserContext";

function CreateRoomPage() {
  const { user, setUser } = useCurrentUser()
  const {isAuthenticated: isAuth0User, getAccessTokenSilently} = useAuth0()
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    let token = null;
    if (isAuth0User) {
      token = await getAccessTokenSilently();
    }
    try {
      const newRoom = await createRoom(token, {
        name: text.trim(),
        description: description.trim(),
        capacity: Number(capacity),
        password: password || undefined,
      });

      console.log(newRoom);
      setText("");
      setDescription("");
      setCapacity(4);
      setPassword("");

      navigate(`/rooms/${newRoom.id}`);
    } catch (error) {
      // console.error("Room creation failed:", error.message);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-room-page">
      <h1 className="create-room-title">Create Study Room</h1>

      {error && (
        <p role="alert" className="create-room-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="create-room-form">
        <div className="form-field">
          <label htmlFor="name">Room Name</label>
          <input
            id="name"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a room name"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
          />
        </div>

        <div className="form-field">
          <label htmlFor="capacity">Capacity</label>
          <select
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          >
            <option value={2}>2 people</option>
            <option value={4}>4 people</option>
            <option value={8}>8 people</option>
            <option value={16}>16 people</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="password">Password (optional)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="4-digit password"
            maxLength={4}
          />
        </div>

        <button type="submit" className="create-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
}

export default CreateRoomPage;