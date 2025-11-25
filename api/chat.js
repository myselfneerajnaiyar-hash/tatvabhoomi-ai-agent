export default async function handler(req, res) {
  const userMessage = req.query.message || "no message received";

  res.status(200).json({
    reply: Echo from TatvaBot: ${userMessage},
  });
}
