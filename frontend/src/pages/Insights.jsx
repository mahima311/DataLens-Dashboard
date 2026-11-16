
import { Link } from "react-router-dom";
import { Lightbulb, Upload, Sparkles } from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";
import {
  getLatestAnalysis,
  formatDate,
} from "../utils/analysisStorage";

export default function Insights() {
  const analysis = getLatestAnalysis();
  const insights = analysis?.insights || [];
  const numericSummary = Object.entries(
    analysis?.numeric_summary || {}
  );

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Insights</h1>
          <p>Explore findings generated from your uploaded dataset.</p>
        </div>

        <Link to="/upload" className="primary-button">
          <Upload size={17} /> Upload another dataset
        </Link>
      </div>

      {!analysis ? (
        <section className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Lightbulb size={25} />
            </div>
            <h3>No insights available</h3>
            <p>
              Upload and analyze a dataset once. Its insights will
              appear here automatically.
            </p>
            <Link to="/upload" className="primary-button">
              Upload data
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section
            className="content-card"
            style={{ marginBottom: 20 }}
          >
            <div className="content-card-header">
              <div>
                <h3 style={{ marginBottom: 5 }}>
                  Latest dataset: {analysis.filename}
                </h3>
                <span className="muted-text">
                  Analyzed {formatDate(analysis.analyzedAt)}
                </span>
              </div>

              <span className="feature-icon">
                <Sparkles size={20} />
              </span>
            </div>

            <div className="kpi-grid" style={{ marginTop: 18 }}>
              <article className="kpi-card">
                <span>Total rows</span>
                <strong className="kpi-value">
                  {analysis.rows ?? 0}
                </strong>
              </article>

              <article className="kpi-card">
                <span>Total columns</span>
                <strong className="kpi-value">
                  {analysis.columns ?? 0}
                </strong>
              </article>

              <article className="kpi-card">
                <span>Missing values</span>
                <strong className="kpi-value">
                  {analysis.total_missing_values ?? 0}
                </strong>
              </article>

              <article className="kpi-card">
                <span>Duplicate rows</span>
                <strong className="kpi-value">
                  {analysis.duplicate_rows ?? 0}
                </strong>
              </article>
            </div>
          </section>

          <section
            className="content-card"
            style={{ marginBottom: 20 }}
          >
            <div className="content-card-header">
              <h3>Dataset insights</h3>
              <span className="muted-text">
                {insights.length} findings
              </span>
            </div>

            {insights.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {insights.map((item, index) => (
                  <article
                    key={`${item.title || item.type}-${index}`}
                    style={{
                      padding: 16,
                      border: "1px solid var(--border, #e5e7eb)",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        marginBottom: 6,
                      }}
                    >
                      <span className="feature-icon">
                        <Lightbulb size={17} />
                      </span>
                      <strong>{item.title || "Dataset finding"}</strong>
                    </div>

                    <p
                      className="muted-text"
                      style={{ margin: 0 }}
                    >
                      {item.message || "No additional details available."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted-text">
                No insight details were returned for this dataset.
              </p>
            )}
          </section>

          <section className="content-card">
            <div className="content-card-header">
              <h3>Numeric summary</h3>
            </div>

            {numericSummary.length ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Mean</th>
                      <th>Minimum</th>
                      <th>Maximum</th>
                      <th>Sum</th>
                    </tr>
                  </thead>

                  <tbody>
                    {numericSummary.map(([column, stats]) => (
                      <tr key={column}>
                        <td>{column}</td>
                        <td>{stats.mean ?? "—"}</td>
                        <td>{stats.min ?? "—"}</td>
                        <td>{stats.max ?? "—"}</td>
                        <td>{stats.sum ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted-text">
                No numeric columns were found.
              </p>
            )}
          </section>
        </>
      )}
    </PrivateLayout>
  );
}
