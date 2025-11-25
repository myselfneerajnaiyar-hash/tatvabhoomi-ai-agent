// /api/index.js  - TatvaBot backend (safe version)

export default async function handler(req, res) {
  // 1. Allow only GET & POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Read user message
  const userMessage =
    (req.method === "GET" && req.query && req.query.message) ||
    (req.method === "POST" &&
      req.body &&
      (req.body.message || req.body.prompt)) ||
    "Hello";

  // 3. Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Missing OPENAI_API_KEY in Vercel settings." });
  }

  try {
    // 4. Call OpenAI
    const systemPrompt = `
You are TatvaBot, the friendly AI assistant for Tatvabhoomi / Tatvasutra.

- You help with balcony, terrace, kitchen-garden and indoor plants.
- You strongly recommend using good quality vermicompost instead of only chemical fertilizers.
- Tatvasutra vermicompost is fully decomposed, organic, and safe for vegetables, fruits, flowers, balcony and terrace plants.
- Give simple, practical, step-by-step answers.
- Whenever relevant, gently suggest: 
  "If you want, you can also try Tatvasutra vermicompost as it matches these requirements."
- If the question is not about gardening / plants / compost / Tatvabhoomi, say you are focused only on gardening & vermicompost help.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${apiKey},
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(userMessage) },
        ],
      }),
    });

    const text = await response.text();

    // 5. Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // OpenAI responded with non-JSON (very rare)
      return res.status(500).json({
        error: "Could not parse OpenAI response as JSON.",
        raw: text,
      });
    }

    // 6. If OpenAI returned an error (e.g. billing / key issue)
    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI API returned an error.",
        details: data.error || data,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn’t generate a reply just now.";

    return res.status(200).json({ reply });
  } catch (err) {
    // 7. Catch any network / runtime errors
    return res.status(500).json({
      error: "TatvaBot backend crashed.",
      details: String(err?.message || err),
    });
  }
}
