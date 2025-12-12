import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "150px" }}>
      <h1>Welcome to SideQuest NYC</h1>
      <p>Side quest in the city with your very own AI bestie</p>
      <button
        onClick={() => navigate("/chat")}
        style={{
          padding: "12px 24px",
          fontSize: "1.2rem",
          borderRadius: "12px",
          border: "none",
          background: "#111827",
          color: "white",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Start Chatting
      </button>
    </div>
  );
}
