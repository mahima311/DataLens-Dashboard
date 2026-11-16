
import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAnalysisRecord } from "../services/analysisStorage";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  BarChart3,
} from "lucide-react";

import PrivateLayout from "../components/PrivateLayout";
import { analyzeDataset } from "../services/api";


const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

function isSupportedFile(file) {
  const name = file.name.toLowerCase();

  return SUPPORTED_EXTENSIONS.some((extension) =>
    name.endsWith(extension)
  );
}

// Read first 10 rows for preview.
function readFilePreview(file) {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();

    if (name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        preview: 10,
        skipEmptyLines: true,

        complete: (result) => {
          if (result.errors?.length && !result.data?.length) {
            reject(new Error("Could not read the CSV file."));
            return;
          }

          resolve({
            columns: result.meta.fields || [],
            rows: result.data || [],
          });
        },

        error: () => {
          reject(new Error("Could not read the CSV file."));
        },
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "array",
          cellDates: true,
        });

        const firstSheet = workbook.SheetNames[0];

        if (!firstSheet) {
          reject(new Error("The Excel file has no worksheets."));
          return;
        }

        const worksheet = workbook.Sheets[firstSheet];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false,
        });

        resolve({
          columns: rows.length ? Object.keys(rows[0]) : [],
          rows: rows.slice(0, 10),
        });
      } catch {
        reject(new Error("Could not read the Excel file."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Save analysis and preview for all other pages.
function saveAnalysis(result, file, preview) {
  return saveAnalysisRecord(result, file, preview);
}
function formatBytes(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Upload() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function selectFile(selectedFile) {
    if (!selectedFile) return;

    setError("");
    setAnalysis(null);
    setPreview(null);

    if (!isSupportedFile(selectedFile)) {
      setFile(null);
      setError("Please select a CSV, XLSX, or XLS file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File size must be 10 MB or less.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("The selected file is empty.");
      return;
    }

    setFile(selectedFile);

    try {
      const result = await readFilePreview(selectedFile);
      setPreview(result);
    } catch (previewError) {
      setError(
        previewError.message || "Could not preview this file."
      );
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analyzeDataset(file);

      if (!result || result.success === false) {
        throw new Error(
          "The backend did not return a valid analysis."
        );
      }

      // Save analysis along with the preview.
      const savedResult = saveAnalysis(
        result,
        file,
        preview
      );

      setAnalysis(savedResult);
    } catch (analysisError) {
      setError(
        analysisError.message ||
          "Analysis failed. Check that the backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <PrivateLayout>
      <div className="upload-page">

        {/* Page heading */}
        <div className="upload-page-header">
          <div>
            <h1>Upload Dataset</h1>
            <p>
              Upload a CSV or Excel file to analyze your data
              and generate insights.
            </p>
          </div>
        </div>

        {/* Upload area */}
        <div
          className={`upload-dropzone ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
        >
          <div className="upload-icon">
            <UploadIcon size={30} />
          </div>

          <h2>Drag and drop your file here</h2>
          <p>or select a file from your computer</p>

          <button
            type="button"
            className="upload-button"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon size={17} />
            Choose File
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={(event) =>
              selectFile(event.target.files?.[0])
            }
          />

          <p className="upload-file-hint">
            Supported formats: CSV, XLSX, XLS · Maximum size: 10 MB
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="upload-message upload-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {/* Selected file */}
        {file && (
          <section className="upload-file-card">
            <div className="upload-file-info">
              <FileSpreadsheet size={28} />

              <div>
                <strong>{file.name}</strong>
                <p>{formatBytes(file.size)}</p>
              </div>
            </div>

            <button
              type="button"
              className="upload-clear-button"
              onClick={clearFile}
              aria-label="Remove selected file"
              title="Remove selected file"
              disabled={loading}
            >
              <X size={19} />
            </button>
          </section>
        )}

        {/* File preview before analysis */}
        {preview && (
          <section className="upload-section">
            <div className="upload-section-heading">
              <div>
                <h2>File Preview</h2>
                <p>
                  Showing up to 10 rows before running the analysis.
                </p>
              </div>

              <span>
                {preview.rows.length} preview rows
              </span>
            </div>

            {preview.columns.length > 0 ? (
              <div className="upload-table-wrapper">
                <table className="upload-table">
                  <thead>
                    <tr>
                      {preview.columns.map((column, index) => (
                        <th key={`${column}-${index}`}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {preview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {preview.columns.map(
                          (column, columnIndex) => (
                            <td key={`${column}-${columnIndex}`}>
                              {row[column] == null ||
                              row[column] === ""
                                ? "—"
                                : String(row[column])}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                No column headers or data rows were found in the preview.
              </p>
            )}
          </section>
        )}

        {/* Analyze button */}
        <div className="upload-actions">
          <button
            type="button"
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  className="upload-spinner"
                  size={18}
                />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                Analyze Dataset
              </>
            )}
          </button>
        </div>

        {/* Analysis results */}
        {analysis && (
          <section className="upload-results">

            <div className="upload-success-heading">
              <CheckCircle size={23} />

              <div>
                <h2>Analysis Completed</h2>
                <p>
                  Your analysis and dataset preview have been saved
                  in this browser. Other pages can read the same
                  saved analysis.
                </p>
              </div>
            </div>

            {/* KPI cards */}
            <div className="upload-kpi-grid">
              <div className="upload-kpi-card">
                <span>Total Rows</span>
                <strong>
                  {analysis.rows ?? 0}
                </strong>
              </div>

              <div className="upload-kpi-card">
                <span>Total Columns</span>
                <strong>
                  {analysis.columns ?? 0}
                </strong>
              </div>

              <div className="upload-kpi-card">
                <span>Duplicate Rows</span>
                <strong>
                  {analysis.duplicate_rows ?? 0}
                </strong>
              </div>

              <div className="upload-kpi-card">
                <span>Missing Values</span>
                <strong>
                  {analysis.total_missing_values ?? 0}
                </strong>
              </div>
            </div>

            {/* Column names */}
            <div className="upload-section">
              <h2>Column Names</h2>

              <div className="upload-column-list">
                {(analysis.column_names || []).map(
                  (column, index) => (
                    <span key={`${column}-${index}`}>
                      {column}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Missing values */}
            <div className="upload-section">
              <h2>Missing Values by Column</h2>

              {Object.keys(
                analysis.missing_values || {}
              ).length ? (
                <div className="upload-table-wrapper">
                  <table className="upload-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Missing Values</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        analysis.missing_values
                      ).map(([column, count]) => (
                        <tr key={column}>
                          <td>{column}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No missing-value information is available.</p>
              )}
            </div>

            {/* Numeric summary */}
            <div className="upload-section">
              <h2>Numeric Summary</h2>

              {Object.keys(
                analysis.numeric_summary || {}
              ).length ? (
                <div className="upload-table-wrapper">
                  <table className="upload-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Count</th>
                        <th>Mean</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Sum</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        analysis.numeric_summary
                      ).map(([column, stats]) => (
                        <tr key={column}>
                          <td>{column}</td>
                          <td>{stats.count ?? "—"}</td>
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
                <p>No numeric columns were found in this dataset.</p>
              )}
            </div>

          </section>
        )}

      </div>
    </PrivateLayout>
  );
}
