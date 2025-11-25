// Simple TatvaBot AI endpoint using OpenAI via HTTP fetch

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET is supported. Use ?message=..." });
    return;
  }

  const userMessage =
    (req.query && req.query.message) ||
    (req.body && req.body.message) ||
    "no message received";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${apiKey},
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are TatvaBot, a friendly gardening and vermicompost expert for the brand Tatvabhoomi. " +
              "Answer clearly and practically. Whenever it genuinely helps, explain why vermicompost is useful " +
              "and gently suggest Tatvasutra vermicompost as an option, but without being pushy.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      res
        .status(500)
        .json({ error: "OpenAI API error", details: data.error || data });
      return;
    }

    const reply =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "Sorry, I couldn't generate a reply.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("TatvaBot server error:", err);
    res.status(500).json({ error: "Server error", details: String(err) });
  }
}
