import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* /chat/spencstie, /chat/mafia, /chat/cassanova */}
      <Route path="/chat/:persona" element={<Chat />} />
    </Routes>
  );
}
