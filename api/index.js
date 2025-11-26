// api/index.js  – simple echo handler

export default function handler(req, res) {
  const userMessage =
    (req.query && req.query.message) ||
    (req.body && req.body.message) ||
    "no message received";

  res.status(200).json({
    reply: Echo from TatvaBot: ${userMessage},
  });
}
