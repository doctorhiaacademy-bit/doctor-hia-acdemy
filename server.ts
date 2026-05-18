import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI Helper
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const contents = [
        {
          role: 'user',
          parts: [{ text: "You are an AI teaching assistant for Dr. HIA Academy, an online learning platform for high school Science subjects (A-Level, IB, IGCSE, HKDSE, EDEXCEL, AQA, CAMBRIDGE). Help students with their science questions, especially Chemistry, Biology, and Physics. Be encouraging and clear." }]
        },
        {
          role: 'model',
          parts: [{ text: "I am ready to help!" }]
        },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to communicate with AI" });
    }
  });

  // API route for generating Quizzes
  app.post("/api/quiz", async (req, res) => {
    try {
      const { subject, level, topic } = req.body;
      const prompt = `Generate a 3-question multiple-choice quiz about "${topic}" for a student at the ${level} level studying ${subject}.
Output the quiz strictly as a JSON array of objects. 
Example format:
[
  {
    "question": "What is the atomic number of Carbon?",
    "options": ["6", "12", "14", "8"],
    "correctAnswer": 0,
    "explanation": "Carbon's atomic number is 6, which indicates it has 6 protons."
  }
]
Return ONLY the raw JSON array. Do not include markdown blocks like \`\`\`json.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      let responseText = response.text || "";
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const quiz = JSON.parse(responseText);

      res.json({ quiz });
    } catch (error) {
      console.error("AI quiz error:", error);
      res.status(500).json({ error: "Failed to generate AI quiz" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
