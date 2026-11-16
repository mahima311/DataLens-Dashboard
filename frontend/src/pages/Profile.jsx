
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrivateLayout from "../components/PrivateLayout";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>My profile</h1>
          <p>View your account information and manage your session.</p>
        </div>
      </div>

      <section className="content-card" style={{ maxWidth: 650 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            className="user-avatar"
            style={{ width: 60, height: 60, fontSize: 22 }}
          >
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              {user?.name || "User"}
            </h2>
            <p className="muted-text" style={{ margin: "5px 0 0" }}>
              DataLens account
            </p>
          </div>
        </div>

        <div className="form-field" style={{ marginTop: 24 }}>
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            value={user?.name || ""}
            readOnly
          />
        </div>

        <div className="form-field">
          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            value={user?.email || ""}
            readOnly
          />
        </div>

        <p className="muted-text">
          Profile editing and server-side account management are not
          available in this demo version.
        </p>

        <div
          style={{
            borderTop: "1px solid var(--border, #e5e7eb)",
            marginTop: 24,
            paddingTop: 20,
          }}
        >
          <h3 style={{ margin: "0 0 7px", fontSize: 16 }}>
            Account session
          </h3>

          <p className="muted-text" style={{ margin: "0 0 15px" }}>
            Log out of your DataLens account on this browser.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </section>
    </PrivateLayout>
  );
}
