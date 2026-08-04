import { Navigate } from "react-router";
import UserIcon from "../components/UserIcon";
import { useState, useEffect } from "react";
import { useCurrentUser } from "../context/CurrentUserContext";
// import { getUsers } from "../api/users"; // object {}

function formatTime(totalSeconds) {
    const seconds = Number(totalSeconds) || 0
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours === 0) { return `${minutes}m`}
    return `${hours}h ${minutes}m`
}

export default function UserList() {
  const { user: currentUser } = useCurrentUser();
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

  const rankedUsers = [...users].sort((firstUser, secondUser) => {
    const firstTime = Number(firstUser.totalStudyTime) || 0;
    const secondTime = Number(secondUser.totalStudyTime) || 0;

    if (secondTime !== firstTime) {
      return secondTime - firstTime;
    }

    const firstName = firstUser.displayName || firstUser.username || "";
    const secondName = secondUser.displayName || secondUser.username || "";
    return firstName.localeCompare(secondName);
  });

  function getRankLabel(index) {
    return index < 10 ? index + 1 : null;
  }

  function isCurrentUser(user) {
    return Number(user.id) === Number(currentUser?.id);
  }

  return (
    <section className="users-page">
      <header className="users-page-header">
        <h1>User List</h1>
        <p> View other students and see how much time they have spent studying.</p>
      </header>

      {error && (
        <p role="alert" className="users-page-error">
          {error}
        </p>
      )}

      {rankedUsers.length === 0 ? (
        <div className="users-empty-state">
          <h2>No users available yet</h2>
          <p>New members will appear here after creating an account.</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="users-table-header">
            <span className="user-rank-heading">Rank</span>
            <span>Profile</span>
            <span>User</span>
            <span>Study time</span>
            <span>School</span>
            <span className="users-actions-heading"> + Friend </span>
          </div>

          <div className="users-table-body">
            {rankedUsers.map((user, index) => {
              const rank = getRankLabel(index);

              return (
                <article
                  key={user.id}
                  className={`user-row${isCurrentUser(user) ? " user-row-current" : ""}`}
                >
                  <span className="user-rank-cell">
                    {rank !== null ? rank : "-"}
                  </span>

                  <div className="user-avatar-cell">
                    <UserIcon
                      user={user}
                      size={46}
                    />
                  </div>

                  <div className="user-identity-cell">
                    <strong> {user.displayName || user.username} </strong>
                    {user.displayName && user.displayName !== user.username && (
                        <span>
                          @{user.username}
                        </span>
                      )}
                  </div>

                  <span className="user-time-cell">
                    {formatTime(user.totalStudyTime)}
                  </span>

                  <span className="user-school-cell">
                    {user.school || "Not listed"}
                  </span>

                  <button
                    type="button"
                    className="user-add-btn"
                    aria-label={`Add ${user.displayName || user.username}`}
                    title="Add user"
                  >
                    +
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}