// /api/chat.js

export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not set in environment variables.",
      });
    }

    // Get user's message (from query string or POST body)
    const userMessage =
      (req.method === "POST" ? req.body?.message : req.query.message) ||
      "Hello";

    // Call OpenAI Responses API
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${apiKey},
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are Tatvabhoomi's friendly gardening assistant. " +
              "Help users with balcony gardens, terrace gardens, indoor plants, " +
              "and vegetable gardens. Explain things simply. " +
              "Whenever it fits naturally, you may softly suggest Tatvabhoomi vermicompost, " +
              "but never push too hard.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error("OpenAI error:", text);
      return res.status(500).json({ error: "OpenAI request failed." });
    }

    const data = await openaiRes.json();

    // Responses API: take first text output
    const reply =
      data?.output?.[0]?.content?.[0]?.text || "Sorry, I couldn’t answer that.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
