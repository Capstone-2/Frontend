import { useState } from "react";

function CreateRoomPage() {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  // Optional for images: const [image, setimage] = useState("")
  const [capacity, setCapacity] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const newRoom = {
      text,
      description,
      capacity: Number(capacity),
      password,
    };

    console.log(newRoom);

    setText("");
    setDescription("");
    setCapacity("");
    setPassword("");
  }

  return (
    <div>
      <h1>Create Study Room</h1>

      <form onSubmit={handleSubmit}>
        <label>Room Name</label>

        <br />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a room name"
        />

        <input
          type="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter Description"
        />

        <input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="How many people"
        />

        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="(Optional)Create Password"
        />
        
        <button type="submit">Create Room</button>
      </form>

      
      
    </div>
  );
}

export default CreateRoomPage;
