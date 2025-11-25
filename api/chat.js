// api/chat.js

export default async function handler(req, res) {
  // --- CORS (for browser calls from tatvasutra.in) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Read user message from GET or POST ---
  let userMessage = "";

  if (req.method === "GET") {
    userMessage = (req.query.message || "").toString();
  } else if (req.method === "POST") {
    try {
      // Vercel parses JSON automatically if header is application/json
      userMessage = (req.body?.message || "").toString();
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!userMessage.trim()) {
    return res.status(400).json({ error: "Missing message" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: Bearer ${apiKey},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `
You are "TatvaBot", the helpful AI assistant for Tatvabhoomi (tatvasutra.in).

Goals:
- Help users with vermicomposting, balcony / terrace gardening, indoor plants, soil health, basic pest issues.
- Suggest Tatvasutra vermicompost and services, but only as a soft, honest recommendation.
- If you don't know something (like exact stock, delivery date, or prices), say that you are not sure and suggest they contact support via WhatsApp or email.

Tone:
- Warm, simple, encouraging.
- Avoid jargon. Explain like to an urban beginner gardener.

If user says only a keyword (like "buy", "setup", "consult"), first ask 1–2 clarifying questions, then guide them.
                `,
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "text", text: userMessage }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res.status(500).json({ error: "AI request failed" });
    }

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "Sorry, I'm having trouble replying right now. Please try again in a moment.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
