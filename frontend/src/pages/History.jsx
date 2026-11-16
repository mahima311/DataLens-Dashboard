
import { Link } from "react-router-dom";
import { History as HistoryIcon, Upload } from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";
import {
  getSavedAnalyses,
  formatDate,
  formatNumber,
} from "../utils/analysisStorage";

export default function History() {
  const analyses = getSavedAnalyses();

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Analysis history</h1>
          <p>Review datasets you have previously analyzed.</p>
        </div>

        <Link to="/upload" className="primary-button">
          <Upload size={17} /> Upload data
        </Link>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <h3>Previous analyses</h3>
          <span className="muted-text">
            {analyses.length} saved dataset(s)
          </span>
        </div>

        {analyses.length ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Rows</th>
                  <th>Columns</th>
                  <th>Missing values</th>
                  <th>Duplicate rows</th>
                  <th>Analyzed on</th>
                </tr>
              </thead>

              <tbody>
                {analyses.map((item, index) => (
                  <tr key={item.id || `${item.filename}-${index}`}>
                    <td>{item.filename || "Unnamed dataset"}</td>
                    <td>{formatNumber(item.rows)}</td>
                    <td>{formatNumber(item.columns)}</td>
                    <td>
                      {formatNumber(item.total_missing_values)}
                    </td>
                    <td>{formatNumber(item.duplicate_rows)}</td>
                    <td>{formatDate(item.analyzedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <HistoryIcon size={25} />
            </div>

            <h3>No analysis history</h3>
            <p>
              After you upload and analyze a dataset, its record
              will automatically appear here.
            </p>

            <Link to="/upload" className="primary-button">
              Upload your first dataset
            </Link>
          </div>
        )}
      </section>
    </PrivateLayout>
  );
}
