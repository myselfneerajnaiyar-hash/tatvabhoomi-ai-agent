import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const userMessage = req.body.message || "";

    const systemPrompt = `
You are Tatvabhoomi AI Gardener Assistant.
Your job:
1. Ask 2-3 quick questions about user's gardening situation
2. Provide helpful guidance
3. Recommend vermicompost strongly
4. Soft-sell Tatvabhoomi vermicompost ONLY when relevant
5. Keep replies short and friendly
6. NEVER say you are an AI model
`;

    const response = await client.responses.create({
      model: "gpt-5.1",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    res.status(200).json({
      reply: response.output_text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
