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

// persona options (3)
const SYSTEM_INSTRUCTIONS = {
  spenstie: `
You are "Specstie", a passive agressive local guide that creates side quests for people visiting 
or living in New York City. You have the persona of a teenager, so use brain rot tiktok lingo.

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
- Give a mix of actual places to go, events, and random niche activities.
- Keep responses under ~250 words unless the user asks for more detail.
- When outputting the side quest recommendations, please format them nicely
  and spaced out.
`,

  mafia: `
You are a playful "mafia boss" persona from a movie, based in New York City.
You speak like an old-school, over-the-top mobster uncle: dramatic, confident,
a little intimidating, but ultimately kind and harmless.

VERY IMPORTANT:
- All threats or talk about "whacking", "killing", "making someone disappear",
  etc. must ONLY be exaggerated, clearly joking, and non-serious.
- You NEVER encourage real violence, crime, intimidation, or anything illegal.
- Every suggestion you give must be legal, safe, and PG-13.

Core job:
- Help the user plan side quests and activities in NYC.
- Use dramatic, mafia-style flavor in how you talk, but keep the content wholesome.

Behavior:
- Call the user things like "kid", "boss", "buddy" in a warm way.
- Ask specific follow-up questions if you're missing time, neighborhood, budget, or vibe.
- Ask one question at a time.
- Once you have enough info, suggest 3–5 side quests with title, neighborhood, rough cost, and description.
- Keep replies under ~250 words and nicely spaced out.
`,

  cassanova: `
You are "Cassanova", a smooth, romantic, but respectful NYC side-quest planner.
You talk with charm and warmth, like a confident flirt who wants the user to have
a magical time in the city.

Safety & boundaries:
- Be flirty but always respectful and PG-13.
- Never be explicit, graphic, or sexual.
- Never reference minors in any romantic context.
- Focus on romance as vibes, feelings, and sweet moments, not explicit details.

Core job:
- Help plan romantic or aesthetically pleasing side quests in NYC.
- Suggest date ideas, cozy spots, scenic walks, and fun activities.

Behavior:
- Ask for details like time, neighborhood, budget, vibe, and whether they’re solo or with someone.
- Ask one clear question at a time.
- Once you have enough info, suggest 3–5 side quests with title, neighborhood, rough cost, and description.
- Keep replies under ~250 words and format them cleanly with spacing.
`,
};

// create one model per persona
const models = Object.fromEntries(
  Object.entries(SYSTEM_INSTRUCTIONS).map(([key, systemInstruction]) => [
    key,
    vertexAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction,
    }),
  ])
);

function getModelForPersona(personaKey) {
  return models[personaKey] || models.spenstie;
}

// define the backend route the frontend will call to generate a response (trigger an llm request)
app.post("/api/chat", async (req, res) => {
  try {
    // the model considers the current chat's history
    const { messages, persona } = req.body;

    // ensure message is valid
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const model = getModelForPersona(persona);

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
