
import { useState } from "react";
import { MessageCircle, Send, Sparkles, LoaderCircle } from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";

const CHAT_API = "http://127.0.0.1:8000/api/chat";

function getDatasetContext() {
  try {
    const saved = localStorage.getItem("datalens_latest_analysis");

    if (!saved) return {};

    const data = JSON.parse(saved);

    return {
      filename: data.filename,
      rows: data.rows,
      columns: data.columns,
      column_names: data.column_names,
      duplicate_rows: data.duplicate_rows,
      missing_values: data.missing_values,
      total_missing_values: data.total_missing_values,
      numeric_summary: data.numeric_summary,
      categorical_summary: data.categorical_summary,
      column_profiles: data.column_profiles,
      insights: data.insights,
      preview: data.preview,
      chart_data: data.chart_data,
    };
  } catch (error) {
    console.error("Could not load dataset context:", error);
    return {};
  }
}

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    const previousMessages = messages;

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const datasetContext = getDatasetContext();

      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          dataset_context: datasetContext,
          history: previousMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to get an answer from Gemini."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.answer,
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `Sorry, something went wrong: ${error.message}. Please check that your backend is running.`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>AI Data Chat</h1>
          <p>Ask questions about your data.</p>
        </div>
      </div>

      <section className="content-card">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Sparkles size={25} />
            </div>

            <h3>What would you like to know?</h3>

            <p>
              Chat with your dataset using AI. Ask about rows, columns,
              missing values, trends, and insights.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
                marginTop: 18,
              }}
            >
              {[
                "How many rows and columns are there?",
                "Tell me the total keys",
                "Are there any missing values?",
                "Give me important insights",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="secondary-button"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {messages.map((message) => (
              <article
                key={message.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    message.role === "user" ? "flex-end" : "flex-start",
                  gap: 6,
                }}
              >
                <strong style={{ fontSize: 13 }}>
                  {message.role === "user" ? "You" : "DataLens AI"}
                </strong>

                <div
                  style={{
                    maxWidth: "85%",
                    padding: "13px 16px",
                    borderRadius: 12,
                    background:
                      message.role === "user"
                        ? "var(--primary-color, #6478e8)"
                        : "var(--background-secondary, #f3f4f6)",
                    color:
                      message.role === "user"
                        ? "#ffffff"
                        : "var(--text-color, #222222)",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    lineHeight: 1.6,
                    border: message.isError ? "1px solid #dc6464" : "none",
                  }}
                >
                  {message.content}
                </div>
              </article>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: 10,
                }}
              >
                <LoaderCircle size={18} className="spin" />
                <span>DataLens AI is thinking...</span>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
          }}
        >
          <input
            className="topbar-search"
            style={{ flex: 1, width: "auto" }}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything about your dataset..."
            aria-label="Ask a question"
            disabled={loading}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={loading || !question.trim()}
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </section>
    </PrivateLayout>
  );
}
