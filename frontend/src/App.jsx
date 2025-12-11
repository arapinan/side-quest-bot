import { useState } from "react";  // allows the ui to update with user interactions
import "./App.css";

function App() {
  // define behavior for interacting with the backend

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, it's Spencstie. Let's make your life a little less boring.\n\nWhen are you planning on FINALLY touching some grass?",
    },
  ]);  // messages = full chat history

  const [input, setInput] = useState("");  // what the user is typing rn
  const [loading, setLoading] = useState(false);  // whether we're waiting for backend/gemini
  const [error, setError] = useState("");  // any error message

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // add the current user message to the chat history
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      // send the full chat history to your backend and wait for reply
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      if (!data.reply) {
        throw new Error("No reply from server");
      }

      // if a valid response, append gemini's reply to the chat history
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    }
    catch (err) {
      console.error(err);
      setError("Failed to talk to Spencstie. Try again.");
    }
    finally {
      setLoading(false);
    }
  };

  // specify ui for the chatbot (html)

  return (
    <div className="app">
      <header className="app-header">
        <h1>[cool-app-name]</h1>
        <p>side quest in the city with you own personal assistant, spencstie</p>
      </header>

      <main className="chat-container">
        <div className="chat-window">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "assistant"
                  ? "bubble bubble-assistant"
                  : "bubble bubble-user"
              }
            >
              {m.content.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ))}

          {loading && (
            <div className="bubble bubble-assistant thinking">
              Spencstie is thinking…
            </div>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* user types input --> submitting the form calls sendMessage fucntion defined above */}
        <form className="input-row" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="type here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "sending..." : "send"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
