export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://redcontinent.com.au');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Handle preflight request
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, lawText } = req.body;

  const fullPrompt = `You are a migration law assistant. Use ONLY the following legal text to answer the user's question. If the answer is not found below, say "I don't have that information."

--- MIGRATION LAW TEXT ---
${lawText}

User Question: ${userInput}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Organization": process.env.OPENAI_ORG_ID // optional
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: 'Failed to get response from OpenAI.' });
  }
}

