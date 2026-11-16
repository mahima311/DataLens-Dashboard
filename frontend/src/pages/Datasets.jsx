
import { Link } from "react-router-dom";
import {
  Database,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";
import {
  getLatestAnalysis,
  getSavedAnalyses,
  formatDate,
  formatNumber,
} from "../utils/analysisStorage";

export default function Datasets() {
  const latest = getLatestAnalysis();
  const datasets = getSavedAnalyses();

  const columns = latest?.column_names || [];
  const previewRows = latest?.preview || [];

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Dataset Preview</h1>
          <p>
            Preview the data from your latest upload without
            uploading it again.
          </p>
        </div>

        <Link to="/upload" className="primary-button">
          <Upload size={17} /> Upload another dataset
        </Link>
      </div>

      {!latest ? (
        <section className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Database size={25} />
            </div>

            <h3>No dataset uploaded yet</h3>
            <p>
              Upload and analyze a CSV or Excel file.
              Its preview will be saved here automatically.
            </p>

            <Link to="/upload" className="primary-button">
              Upload a dataset
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span className="feature-icon">
                  <FileSpreadsheet size={21} />
                </span>

                <div>
                  <h3 style={{ margin: 0 }}>
                    {latest.filename || "Uploaded dataset"}
                  </h3>

                  <span className="muted-text">
                    Last analyzed: {formatDate(latest.analyzedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="kpi-grid" style={{ marginTop: 18 }}>
              <article className="kpi-card">
                <span>Total rows</span>
                <strong className="kpi-value">
                  {formatNumber(latest.rows)}
                </strong>
              </article>

              <article className="kpi-card">
                <span>Total columns</span>
                <strong className="kpi-value">
                  {formatNumber(latest.columns)}
                </strong>
              </article>

              <article className="kpi-card">
                <span>File size</span>
                <strong className="kpi-value">
                  {latest.file_size
                    ? `${(latest.file_size / 1024).toFixed(1)} KB`
                    : "—"}
                </strong>
              </article>
            </div>
          </section>

          <section
            className="content-card"
            style={{ marginBottom: 20 }}
          >
            <div className="content-card-header">
              <h3>Data preview</h3>
              <span className="muted-text">
                Showing first {previewRows.length} rows
              </span>
            </div>

            {previewRows.length && columns.length ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      {columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        {columns.map((column) => (
                          <td key={column}>
                            {row[column] == null || row[column] === ""
                              ? "—"
                              : String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted-text">
                The analysis did not include preview rows for this dataset.
              </p>
            )}
          </section>

          <section className="content-card">
            <div className="content-card-header">
              <h3>Saved datasets</h3>
              <span className="muted-text">
                {datasets.length} dataset(s)
              </span>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Rows</th>
                    <th>Columns</th>
                    <th>Analyzed</th>
                  </tr>
                </thead>

                <tbody>
                  {datasets.map((item, index) => (
                    <tr key={item.id || `${item.filename}-${index}`}>
                      <td>{item.filename || "Unnamed dataset"}</td>
                      <td>{formatNumber(item.rows)}</td>
                      <td>{formatNumber(item.columns)}</td>
                      <td>{formatDate(item.analyzedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PrivateLayout>
  );
}
