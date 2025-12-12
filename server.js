import express from "express";  // creates a backend server
import cors from "cors";  // allows react (frontend) to talk to the backend
import dotenv from "dotenv";  // loads api key from .env
import { VertexAI } from "@google-cloud/vertexai";  // google's software development kit to call gemini models

dotenv.config();

// setup the server
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// connect the server to gcp by configuring vertex ai
const vertexAI = new VertexAI({
  project: "tldr-project-479118",
  location: "us-central1",
});

// define the gemini model and give it conversation instructions for its general behavior
const model = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
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
- When outputting the side quest recommendations, please format them nicely
  and spaced out.
- Don't use astericks.
`,
});

// define the backend route the frontend will call to generate a response (trigger an llm request)
app.post("/api/chat", async (req, res) => {
  try {
    // the model considers the current chat's history
    const { messages } = req.body;

    // ensure message is valid
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // convert messages into gemini format
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // send request to gemini
    const result = await model.generateContent({ contents });

    // extract the text reply string from the complex object that gemini returns
    const candidates = result?.response?.candidates;
    const text =
      candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    // send gemini's reply to the frontend
    res.json({ reply: text });
  }
  catch (err) {
    console.error("Error talking to Gemini:", err);
    res.status(500).json({ error: "Vertex AI Gemini failed" });
  }
});

// starts the backend server
app.listen(PORT, () => {
  console.log(`SideQuest NYC running on http://localhost:${PORT}`);
});
