
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

export function getSavedAnalyses() {
  const saved = readJSON(DATASETS_KEY, []);
  const latest = readJSON(LATEST_KEY, null);

  const datasets = Array.isArray(saved) ? saved : [];

  if (
    latest &&
    !datasets.some(
      (item) =>
        item.id === latest.id ||
        (item.filename === latest.filename &&
          item.analyzedAt === latest.analyzedAt)
    )
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

export function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString();
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
