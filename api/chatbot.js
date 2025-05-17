// pages/api/chatbot.js
export default async function handler(req, res) {
  // ✅ Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight requests (CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput, lawText } = req.body;

  if (!userInput || !lawText) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    const prompt = `You are a migration law assistant. Use ONLY the following legal text to answer the user's question. If the answer is not found below, say "I don't have that information."

--- MIGRATION LAW TEXT ---
${lawText}

User Question: ${userInput}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Organization": process.env.OPENAI_ORG_ID || ""
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    const data = await openaiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
