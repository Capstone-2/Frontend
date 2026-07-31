import UserIcon from "..components/";
// import { getUsers } from "../api/users"; // object {}

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
      } catch (error) {}
    }
  });

  return (
    <div>
      <h4>User List</h4>
      <div>users.map((user) = ())</div>

      {/* <UserIcon {user}/> */}
    </div>
  );
}
