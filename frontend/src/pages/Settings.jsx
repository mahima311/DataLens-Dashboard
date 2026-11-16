
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";

export default function Settings() {
  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Application preferences and information.</p>
        </div>
      </div>

      <section className="content-card" style={{ maxWidth: 750 }}>
        <div className="upload-tip">
          <span className="feature-icon"><SettingsIcon size={20} /></span>
          <div>
            <h4>Workspace preferences</h4>
            <p>Additional theme and workspace options can be added here.</p>
          </div>
        </div>

        <div className="upload-tip" style={{ marginTop: 25 }}>
          <span className="feature-icon"><ShieldCheck size={20} /></span>
          <div>
            <h4>Account security</h4>
            <p>
              This version uses browser-based demo authentication. Do not use
              real passwords or sensitive personal data.
            </p>
          </div>
        </div>
      </section>
    </PrivateLayout>
  );
}
