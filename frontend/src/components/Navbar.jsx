
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-topbar">
      <label className="topbar-search">
        <Search size={16} />
        <input
          aria-label="Search"
          placeholder="Search your workspace..."
          style={{
            width: "90%",
            marginLeft: 8,
            border: 0,
            outline: 0,
            background: "transparent"
          }}
        />
      </label>

      <div className="topbar-user">
        <Link to="/profile" className="user-avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </Link>

        <span className="user-name">{user?.name || "User"}</span>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          style={{ minHeight: 36, padding: "0 10px" }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
