import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userMessage =
      req.method === "GET" ? req.query.message : req.body.message;

    if (!userMessage || userMessage.length === 0) {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Tatvabhoomi's AI assistant. Help users with vermicompost, balcony/terrace gardening, plant care, and Tatvasutra products in a friendly, simple way.",
        },
        {
          role: "user",
          content: String(userMessage),
        },
      ],
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply: answer });
  } catch (error) {
    console.error("Tatvabhoomi AI error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
