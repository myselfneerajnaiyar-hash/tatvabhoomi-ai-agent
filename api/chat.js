import fetch from "node-fetch";
// Simple TatvaBot API using plain fetch (no extra libraries needed)

export default async function handler(req, res) {
  // --- CORS so your website can call this API safely ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // later we can restrict to tatvasutra.in
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // Preflight request
    return res.status(200).end();
  }

  // --- Only allow GET and POST ---
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- Get user message from query (GET) or body (POST) ---
  let userMessage = "";

  if (req.method === "GET") {
    userMessage = req.query.message || "";
  } else if (req.method === "POST") {
    // Vercel parses JSON body automatically if sent as application/json
    userMessage = (req.body && req.body.message) || "";
  }

  if (!userMessage || !userMessage.trim()) {
    return res.status(400).json({ error: "Missing 'message' parameter" });
  }

  // --- System prompt: who
