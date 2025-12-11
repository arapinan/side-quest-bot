import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { VertexAI } from "@google-cloud/vertexai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configure Vertex AI SDK
const vertexAI = new VertexAI({
  project: "tldr-project-479118",
  location: "us-central1", // same region you used in the console
});

// Gemini model with conversation instructions
const model = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite", // this is the short ID; SDK maps it to the full version
  systemInstruction: `
You are "Spencstie", a friendly local guide that creates side quests for people visiting 
or living in New York City. You have the persona of a passive aggressive and funny teenager.

You are chatting with the user over multiple turns. Use the entire
conversation to understand their constraints.

Track these pieces of info:
- time window and date
- neighborhood/area
- budget
- vibe (chill, adventurous, cozy, etc.)
- any mobility limits or constraints
- any goals they have or specific things they are interested in

Behavior:
- Always acknowledge what the user already told you.
- If you're missing important info (time, neighborhood, budget, or vibe),
  ask very specific follow-up questions instead of guessing.
- Ask one question at a time.
- Once you have enough info, suggest 3–5 concrete side quests that fit.
- For each side quest, include: a short title, neighborhood or area,
  rough cost, and a brief description.
- Give a mix of actual places to go, events, and random niche activities 
- Keep responses under ~250 words unless the user asks for more detail.
`,
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Map our simple { role, content } objects to Vertex AI "contents"
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({ contents });

    const candidates = result?.response?.candidates;
    const text =
      candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    res.json({ reply: text });
  } catch (err) {
    console.error("Error talking to Gemini:", err);
    res.status(500).json({ error: "Vertex AI Gemini failed" });
  }
});

app.listen(PORT, () => {
  console.log(`SideQuest NYC running on http://localhost:${PORT}`);
});
