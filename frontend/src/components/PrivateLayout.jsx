
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { RotateCcw } from "lucide-react";
import { clearSavedAnalyses } from "../services/analysisStorage";

export default function PrivateLayout({ children }) {
  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure? This will clear all saved datasets and analysis history. Your login will not be affected."
    );

    if (!confirmed) return;

    clearSavedAnalyses();
    window.location.reload();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 24px 0",
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            title="Reset saved datasets"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 11px",
              border: "1px solid #e5e7eb",
              borderRadius: "7px",
              background: "transparent",
              color: "#dc2626",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
