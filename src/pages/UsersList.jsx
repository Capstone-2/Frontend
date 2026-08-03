import { Navigate } from "react-router";
import UserIcon from "../components/UserIcon";
import { useState, useEffect } from "react";
// import { getUsers } from "../api/users"; // object {}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState();

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

  function formaStudyTime(user) {
    const seconds = user.totalStudyTime;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    /*floor: give biggest integer not bigger the number itself */

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (hours > 0 && minutes == 0) {
      return `${hours}h`;
    }

    return `${minutes}m`;
  }

  return (
    <div>
      <h1>User List</h1>
      <table>
        <caption>Hey, How's studying going ?</caption>
        <thead>
          <tr>
            {/*  <td>&nbsp;</td> */}
            <th>Icon</th>
            <th scope="col">User Name</th>
            <th scope="col">Time Rank</th>
            <th scope="col">School</th>
            <th scope="col">Connect</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <td>No users available yet.</td>
          ) : (
            (users.sort(
              (user1, user2) => user2.totalStudyTime - user1.totalStudyTime,
            ),
            users.map((user) => (
              <tr key={user.id}>
                {/* Use key for React list identity */}
                {/*  <td>{user.id}</td> */}
                <td className="center">{<UserIcon user={user} />}</td>
                <td>{user.displayName || "Visitor"}</td>
                {/*  { <td className="center"> */}
                {/*React className, then Tailwind CSS: Tailwind’s flex utility sets display: flex*/}

                {/* </td>} */}
                <td>{formaStudyTime(user)}</td>
                <td>{user.school}</td>
                <td>
                  <button /* onClick={() => Navigate(``)} */> ➕ </button>
                </td>
              </tr>
            )))
          )}
        </tbody>
      </table>
    </div>
  );
}
