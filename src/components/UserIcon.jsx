// import { useCurrentUser } from "../context/CurrentUserContext";

export default function UserIcon({ user, size = 60 }) {
  //   const { user, sestUser } = useCurrentUser({}); //object, set context

  return (
    <img
      className="user-icon"
      src={user.icon || "/icon2.jpg"}
      alt={user.displayName || user.username}
      style={{ width: size, height: size }}
    />
  );
}
