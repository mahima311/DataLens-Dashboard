
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Lightbulb,
  History,
  UserRound,
  Settings,
  ChartNoAxesCombined,
} from "lucide-react";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Insights", path: "/insights", icon: Lightbulb },
  { label: "History", path: "/history", icon: History },
  { label: "Dataset Preview", path: "/datasets", icon: Database },
];

const accountLinks = [
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "Settings", path: "/settings", icon: Settings },
];

function SidebarLinks({ links }) {
  return (
    <nav className="sidebar-nav">
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `sidebar-link${isActive ? " active" : ""}`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <NavLink to="/dashboard" className="brand-logo">
          <span className="brand-icon">
            <ChartNoAxesCombined size={22} />
          </span>
          <span className="brand-name">DataLens</span>
        </NavLink>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>
      <SidebarLinks links={mainLinks} />

      <div className="sidebar-bottom">
        <div className="sidebar-section-label">ACCOUNT</div>
        <SidebarLinks links={accountLinks} />
      </div>
    </aside>
  );
}
