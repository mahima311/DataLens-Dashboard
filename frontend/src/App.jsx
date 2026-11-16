
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Datasets from "./pages/Datasets";
import Insights from "./pages/Insights";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function PrivatePage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route
        path="/dashboard"
        element={<PrivatePage><Dashboard /></PrivatePage>}
      />

      <Route
        path="/upload"
        element={<PrivatePage><Upload /></PrivatePage>}
      />

      <Route
        path="/datasets"
        element={<PrivatePage><Datasets /></PrivatePage>}
      />

      <Route
        path="/insights"
        element={<PrivatePage><Insights /></PrivatePage>}
      />

      <Route
        path="/history"
        element={<PrivatePage><History /></PrivatePage>}
      />

      <Route
        path="/reports"
        element={<PrivatePage><Reports /></PrivatePage>}
      />

      <Route
        path="/profile"
        element={<PrivatePage><Profile /></PrivatePage>}
      />

      <Route
        path="/settings"
        element={<PrivatePage><Settings /></PrivatePage>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
