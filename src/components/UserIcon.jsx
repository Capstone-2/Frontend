// import { useCurrentUser } from "../context/CurrentUserContext";

export default function UserIcon({ user, size = 80 }) {
  //   const { user, sestUser } = useCurrentUser({}); //object, set context

  return (
    <img
      className="user-icon"
      src={user.icon || "/icon1.jpg"}
      alt={user.displayName || user.username}
      style={{ width: size, height: size }}
    />
  );
}
