
const LATEST_KEY = "datalens_latest_analysis";
const DATASETS_KEY = "datalens_datasets";

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveAnalysisRecord(result, file, preview) {
  const record = {
    ...result,
    id: `${Date.now()}`,
    filename: result.filename || file.name,
    file_size: result.file_size ?? file.size,
    analyzedAt: new Date().toISOString(),

    column_names:
      result.column_names?.length > 0
        ? result.column_names
        : preview?.columns || [],

    preview: preview?.rows?.length
      ? preview.rows
      : result.preview || [],
  };

  localStorage.setItem(LATEST_KEY, JSON.stringify(record));

  const existing = readJSON(DATASETS_KEY, []);
  const datasets = Array.isArray(existing) ? existing : [];

  const updated = [
    record,
    ...datasets.filter(
      (item) => item.filename !== record.filename
    ),
  ].slice(0, 20);

  localStorage.setItem(DATASETS_KEY, JSON.stringify(updated));

  window.dispatchEvent(new Event("datalens-analysis-updated"));

  return record;
}

export function getSavedAnalyses() {
  const saved = readJSON(DATASETS_KEY, []);
  const latest = readJSON(LATEST_KEY, null);

  const datasets = Array.isArray(saved) ? [...saved] : [];

  if (
    latest &&
    !datasets.some((item) => item.id === latest.id)
  ) {
    datasets.unshift(latest);
  }

  return datasets;
}

export function getLatestAnalysis() {
  const latest = readJSON(LATEST_KEY, null);

  if (latest) return latest;

  return getSavedAnalyses()[0] || null;
}

// Clear saved dataset analysis without affecting login.
export function clearSavedAnalyses() {
  localStorage.removeItem(LATEST_KEY);
  localStorage.removeItem(DATASETS_KEY);

  window.dispatchEvent(new Event("datalens-analysis-updated"));
}

export function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
