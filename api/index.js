const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET supported" });
    return;
  }

  const userMessage =
    (req.query && req.query.message) ||
    (req.body && req.body.message) ||
    "no message received";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY missing" });
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
              "You are TatvaBot, a friendly gardening and vermicompost expert for the brand Tatvabhoomi. Whenever helpful, gently recommend Tatvasutra vermicompost.",
          },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await response.json();

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
};
