const MODEL = "gemini-3.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SEARCH_PRODUCTS_TOOL = {
  name: "search_products",
  description:
    "Search the real Jegz Menswear product catalogue. Always call this before recommending or mentioning any specific product — never invent products or details.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: {
        type: "STRING",
        description:
          "Free text to search across product name, description, and collection name (e.g. 'wedding shirt', 'street jacket', 'minimal trousers').",
      },
      minPrice: { type: "NUMBER", description: "Minimum price in NGN, optional." },
      maxPrice: { type: "NUMBER", description: "Maximum price in NGN, optional." },
      size: {
        type: "STRING",
        description: "Optional size to filter by in-stock availability, e.g. 'M', 'L', 'XL'.",
      },
    },
  },
};

async function callGemini(contents, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      tools: [{ functionDeclarations: [SEARCH_PRODUCTS_TOOL] }],
    }),
  });

  if (res.status === 429) {
    const err = new Error("Gemini rate limit reached");
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  return res.json();
}

function extractFunctionCall(response) {
  const parts = response.candidates?.[0]?.content?.parts || [];
  const callPart = parts.find((p) => p.functionCall);
  return callPart?.functionCall || null;
}

function extractText(response) {
  const parts = response.candidates?.[0]?.content?.parts || [];
  return parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join("")
    .trim();
}

module.exports = { callGemini, extractFunctionCall, extractText, MODEL };