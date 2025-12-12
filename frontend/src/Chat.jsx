import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./App.css";

const GREETINGS = {
  spenstie:
    "Hey, it's Spenstie. Let's make your life a little less boring.\n\nWhen are you planning on FINALLY touching some grass?",
  mafia:
    "Ey, kid. The name's Don. I'm gonna help you have a good time in this city—strictly legit, capisce?\n\nWhen are you heading out for your little 'operation'?",
  cassanova:
    "Ciao, I'm Romeo, your romantic side-quest architect.\n\nWhen are you hoping to wander the city and make some memories?",
};

function Chat() {

  // define components for the ui:

  // define which persona we are chatting with
  const { persona } = useParams();
  const personaKey = GREETINGS[persona] ? persona : "spenstie";

  const PERSONA_COLORS = {
    spenstie: "#F4BB44",
    mafia: "#0F52BA",
    cassanova: "#DE3163",
  };

  const personaColor = PERSONA_COLORS[personaKey] || "#111"; 

  // define component states
  const [messages, setMessages] = useState([]); // messages = full chat history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typedText, setTypedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // when the page loads, set the initial greeting message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: GREETINGS[personaKey],
      },
    ]);
  }, [personaKey]);

  // implement the typewriter effect
  useEffect(() => {
    const lastIndex = messages.length - 1;
    if (lastIndex < 0) return;

    const lastMessage = messages[lastIndex];
    if (lastMessage.role !== "assistant") return;

    const fullText = lastMessage.content;

    setTypingIndex(lastIndex);
    setTypedText("");

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedText(fullText.slice(0, i));

      if (i >= fullText.length) {
        clearInterval(interval);
        setTypingIndex(-1);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [messages]);

  // implement autoscroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typedText]);

  // implement an active cursor in the input bar
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // define behavior for interacting with the backend:

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
        body: JSON.stringify({ 
          messages: newMessages,
          persona: personaKey
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.reply) throw new Error("No reply from server");

      // if a valid response, append gemini's reply to the chat history
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    }
    catch (err) {
      console.error(err);
      setError("Failed to talk to guide. Try again.");
    }
    finally {
      setLoading(false);
    }
  };

  // specify ui for the chatbot (html)

  return (
    <div className="app" style={{ "--personaColor": personaColor }}>
      <header className="app-header">
        <h1>SideQuest NYC</h1>
      </header>

      <main>
        {messages.map((m, idx) => {
          if (m.role === "assistant") {
            const isTyping = idx === typingIndex;
            const textToDisplay = isTyping ? typedText : m.content;

            return (
              <div key={idx} className="message-assistant">
                {textToDisplay}
              </div>
            );
          }

          return (
            <div key={idx} className="message-user">
              <div className="user-bubble">{m.content}</div>
            </div>
          );
        })}

        {loading && (
          <div className="thinking-bubble-container">
            <div className="thinking-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div ref={bottomRef} />

        <form className="input-row" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            ref={inputRef}
            autoFocus
          />
        </form>
      </main>
    </div>
  );
}

export default Chat;
