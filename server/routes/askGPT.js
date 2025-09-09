// server/askGPT.js
import "dotenv/config";
import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });


export default async function askGPT(req, res) {
  try {
    const { command, context } = req.body || {};
    if (!command || typeof command !== "string") {
      return res.status(400).json({ error: "command (string) is required" });
    }

    const messages = [
      { role: "system", content: context || "You are IVY, an AI business assistant." },
      { role: "user", content: command },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "No response.";
    res.json({ reply, memory: null });
  } catch (err) {
    console.error("ask-gpt error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
