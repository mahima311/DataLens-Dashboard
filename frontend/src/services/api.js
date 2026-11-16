
const API_BASE_URL = "http://127.0.0.1:8000";

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed.");
  }

  return response.json();
}

export async function analyzeDataset(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The backend returned an invalid response.");
  }

  if (!response.ok) {
    const message =
      typeof result.detail === "string"
        ? result.detail
        : `Analysis failed with status ${response.status}`;

    throw new Error(message);
  }

  return result;
}
