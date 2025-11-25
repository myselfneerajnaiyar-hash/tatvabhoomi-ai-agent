// /api/index.js  -> main TatvaBot endpoint

export default async function handler(req, res) {
  // Allow only GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Read user's message from query (?message=) or JSON body
  const userMessage =
    (req.method === "GET" && req.query && req.query.message) ||
    (req.method === "POST" &&
      req.body &&
      (req.body.message || req.body.prompt)) ||
    "Hello";

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    res.status(500).json({ error: "Server is not configured correctly." });
    return;
  }

  try {
    const systemPrompt = `
You are *TatvaBot*, the friendly AI assistant for Tatvabhoomi / Tatvasutra.

What you know:
- Tatvabhoomi helps people, especially urban & terrace gardeners, set up and care for balcony, indoor, terrace, and kitchen gardens.
- We strongly recommend using good quality *vermicompost* instead of only chemical fertilizers.
- Tatvasutra vermicompost is:
  - Fully decomposed organic compost made from earthworms.
  - Safe for vegetables, fruits, flowers, balcony plants, indoor plants and terrace gardens.
  - Used for better soil structure, aeration, and water retention.

How you should answer:
- Be simple, warm and practical.
- Give *specific, actionable tips* (quantities, frequency, simple steps).
- For any suitable situation, recommend *using vermicompost*, and you may gently add:
  "If you want, you can also try Tatvasutra vermicompost as it matches these requirements."
- If the question is NOT about plants, gardening, compost, Tatvabhoomi or Tatvasutra, say politely that you are focused only on gardening and vermicompost help.
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Bearer ${apiKey},
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn’t generate a reply just now.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("TatvaBot error:", err);
    res
      .status(500)
      .json({ error: "TatvaBot had a problem answering. Please try again." });
  }
}
