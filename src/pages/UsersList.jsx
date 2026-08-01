import UserIcon from "../components/UserIcon";
import { useState, useEffect } from "react";
// import { getUsers } from "../api/users"; // object {}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log("userlist Path: ", `${import.meta.env.VITE_API_URL}/users`);
        const allUsers = await fetch(`${import.meta.env.VITE_API_URL}/users`)
          .then((response) => response.json())
          .then((data) => setUsers(data));
      } catch (error) {
        setError(error.message);
      }
    }
    fetchUsers();
  }, []);

  console.log("users: ", users);

  return (
    <div>
      <h1>User List</h1>
      <div>
        {users.length === 0 ? (
          <p>No users available yet.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-list">
              <p>{user.displayName}</p>
              <ol>{user.totalStudyTime}</ol>
              {<UserIcon user />}
              <p>{user.school}</p>
              <button> ➕ </button>
            </div>
          ))
        )}
      </div>

      {/* <UserIcon {user}/> */}
    </div>
  );
}
