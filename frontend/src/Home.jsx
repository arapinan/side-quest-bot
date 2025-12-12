// src/Home.jsx
import { useNavigate } from "react-router-dom";
import "./App.css"; // or your home styles

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1 className="home-title">Welcome to SideQuest NYC</h1>
      <p>Side-quest in the city with your very own AI assistant</p>
      <p className="home-subtitle">Choose your guide:</p>

      <div className="persona-buttons">
        <button
            className="persona-btn spenstie"
            onClick={() => navigate("/chat/specstie")}
            style={{ background: "#F4BB44" }}
        >
            Spenstie the Sassy Teen
        </button>

        <button
            className="persona-btn mafia"
            onClick={() => navigate("/chat/mafia")}
            style={{ background: "#0F52BA" }}
        >
            Don the (chill) Mafia Boss
        </button>

        <button
            className="persona-btn cassanova"
            onClick={() => navigate("/chat/cassanova")}
            style={{ background: "#DE3163" }}
        >
            Romeo the Romantic
        </button>
      </div>
    </div>
  );
}
