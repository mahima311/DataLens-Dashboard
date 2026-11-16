
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Database,
  Rows3,
  Columns3,
  CircleAlert,
  Copy,
  BarChart3,
  PieChart,
  ChartScatter,
  Activity,
} from "lucide-react";

import PrivateLayout from "../components/PrivateLayout";
import {
  getLatestAnalysis,
  formatNumber,
} from "../utils/analysisStorage";

function StatCard({ label, value, icon: Icon, caption }) {
  return (
    <article className="kpi-card">
      <div className="kpi-card-top">
        <span>{label}</span>
        <span className="kpi-icon">
          <Icon size={19} />
        </span>
      </div>
      <strong className="kpi-value">{formatNumber(value)}</strong>
      <span className="kpi-caption">{caption}</span>
    </article>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="dashboard-chart-empty">
      <BarChart3 size={28} />
      <p>{message}</p>
    </div>
  );
}

function CategoryChart({ name, categories }) {
  const items = (categories || []).slice(0, 8);
  const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0);

  if (!items.length || !total) return null;

  const colors = [
    "#6478e8",
    "#22a699",
    "#f4a340",
    "#df6b8b",
    "#8c72cf",
    "#48a7d5",
    "#9aab55",
    "#bd815c",
  ];

  let current = 0;
  const gradient = items.map((item, index) => {
    const start = current;
    current += (Number(item.count) / total) * 100;
    return `${colors[index % colors.length]} ${start}% ${current}%`;
  }).join(", ");

  return (
    <section className="content-card dashboard-chart-card">
      <div className="content-card-header">
        <h3>{name}</h3>
        <PieChart size={19} />
      </div>

      <div className="dashboard-donut-layout">
        <div
          className="dashboard-donut"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="dashboard-donut-hole">
            <strong>{formatNumber(total)}</strong>
            <small>Records</small>
          </div>
        </div>

        <div className="dashboard-legend">
          {items.map((item, index) => (
            <div className="dashboard-legend-row" key={item.category}>
              <span
                className="dashboard-legend-dot"
                style={{ background: colors[index % colors.length] }}
              />
              <span className="dashboard-legend-name">
                {item.category}
              </span>
              <strong>{formatNumber(item.count)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NumericChart({ name, stats }) {
  const values = [
    { label: "Minimum", value: Number(stats.min) },
    { label: "Average", value: Number(stats.mean) },
    { label: "Median", value: Number(stats.median) },
    { label: "Maximum", value: Number(stats.max) },
  ].filter((item) => Number.isFinite(item.value));

  if (!values.length) return null;

  const min = Math.min(0, ...values.map((item) => item.value));
  const max = Math.max(1, ...values.map((item) => item.value));
  const range = max - min || 1;

  return (
    <section className="content-card dashboard-chart-card">
      <div className="content-card-header">
        <h3>{name}</h3>
        <BarChart3 size={19} />
      </div>

      <div className="dashboard-bars">
        {values.map((item) => (
          <div className="dashboard-bar-item" key={item.label}>
            <div className="dashboard-bar-value">
              {item.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill"
                style={{
                  width: `${Math.max(
                    2,
                    ((item.value - min) / range) * 100
                  )}%`,
                }}
              />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScatterChart({ points, xName, yName }) {
  const validPoints = (points || []).filter(
    (point) =>
      Number.isFinite(Number(point.x)) &&
      Number.isFinite(Number(point.y))
  );

  if (!validPoints.length) return null;

  const xs = validPoints.map((point) => Number(point.x));
  const ys = validPoints.map((point) => Number(point.y));

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return (
    <section className="content-card dashboard-chart-card">
      <div className="content-card-header">
        <h3>{xName} vs {yName}</h3>
        <ChartScatter size={19} />
      </div>

      <svg
        viewBox="0 0 600 260"
        className="dashboard-scatter-svg"
        role="img"
        aria-label={`Scatter plot of ${xName} and ${yName}`}
      >
        <line x1="45" y1="15" x2="45" y2="220" stroke="currentColor" opacity=".3" />
        <line x1="45" y1="220" x2="580" y2="220" stroke="currentColor" opacity=".3" />

        {validPoints.map((point, index) => {
          const x = 45 + ((Number(point.x) - minX) / rangeX) * 525;
          const y = 220 - ((Number(point.y) - minY) / rangeY) * 195;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#6478e8"
              opacity=".65"
            />
          );
        })}
      </svg>

      <p className="muted-text">
        X: {xName} · Y: {yName}
      </p>
    </section>
  );
}

export default function Dashboard() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    const loadLatest = () => {
      setLatest(getLatestAnalysis());
    };

    loadLatest();

    window.addEventListener("storage", loadLatest);
    window.addEventListener("datalens-analysis-updated", loadLatest);

    return () => {
      window.removeEventListener("storage", loadLatest);
      window.removeEventListener("datalens-analysis-updated", loadLatest);
    };
  }, []);

  const numericEntries = useMemo(
    () => Object.entries(latest?.numeric_summary || {}),
    [latest]
  );

  const categoryEntries = useMemo(
    () => Object.entries(latest?.categorical_summary || {}),
    [latest]
  );

  const scatter = latest?.chart_data?.scatter || null;

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Explore the analysis and visualizations of your latest dataset.
          </p>
          {latest?.filename && (
            <p className="muted-text">
              Current dataset: <strong>{latest.filename}</strong>
            </p>
          )}
        </div>

        <Link to="/upload" className="primary-button">
          <Upload size={17} />
          Upload Dataset
        </Link>
      </div>

      <div className="kpi-grid">
        <StatCard
          label="Total rows"
          value={latest?.rows}
          icon={Rows3}
          caption="Rows in current dataset"
        />
        <StatCard
          label="Total columns"
          value={latest?.columns}
          icon={Columns3}
          caption="Columns in current dataset"
        />
        <StatCard
          label="Missing values"
          value={latest?.total_missing_values}
          icon={CircleAlert}
          caption="Missing cells"
        />
        <StatCard
          label="Duplicate rows"
          value={latest?.duplicate_rows}
          icon={Copy}
          caption="Duplicate records"
        />
      </div>

      {!latest ? (
        <section className="content-card dashboard-no-data">
          <div className="empty-state-icon">
            <Database size={28} />
          </div>
          <h3>No dataset analyzed yet</h3>
          <p>Upload a CSV or Excel file to generate your dashboard.</p>
          <Link to="/upload" className="primary-button">
            <Upload size={17} />
            Upload your first dataset
          </Link>
        </section>
      ) : (
        <>
          <div className="dashboard-section-heading">
            <div>
              <h2>Dataset Visualizations</h2>
              <p className="muted-text">
                Charts are selected from the columns available in your dataset.
              </p>
            </div>
          </div>

          <div className="dashboard-charts-grid">
            {categoryEntries.map(([name, summary]) => (
              <CategoryChart
                key={name}
                name={name}
                categories={summary.top_categories}
              />
            ))}

            {numericEntries.map(([name, stats]) => (
              <NumericChart
                key={name}
                name={name}
                stats={stats}
              />
            ))}

            {scatter?.points?.length > 0 && (
              <ScatterChart
                points={scatter.points}
                xName={scatter.x_column}
                yName={scatter.y_column}
              />
            )}
          </div>

          {numericEntries.length === 0 && categoryEntries.length === 0 && (
            <section className="content-card">
              <EmptyChart message="No suitable numeric or categorical columns were found for charts." />
            </section>
          )}

          <div className="dashboard-section-heading">
            <div>
              <h2>Dataset Information</h2>
              <p className="muted-text">
                Summary of the current analysis.
              </p>
            </div>
          </div>

          <section className="content-card dashboard-info-card">
            <div className="dashboard-info-row">
              <span>File name</span>
              <strong>{latest.filename || "Unknown"}</strong>
            </div>
            <div className="dashboard-info-row">
              <span>File size</span>
              <strong>
                {latest.file_size
                  ? `${(latest.file_size / 1024).toFixed(2)} KB`
                  : "Unavailable"}
              </strong>
            </div>
            <div className="dashboard-info-row">
              <span>Analyzed on</span>
              <strong>
                {latest.analyzedAt
                  ? new Date(latest.analyzedAt).toLocaleString()
                  : "Unavailable"}
              </strong>
            </div>
            <div className="dashboard-info-row">
              <span>Numeric columns</span>
              <strong>{numericEntries.length}</strong>
            </div>
            <div className="dashboard-info-row">
              <span>Categorical columns</span>
              <strong>{categoryEntries.length}</strong>
            </div>
          </section>
        </>
      )}
    </PrivateLayout>
  );
}
