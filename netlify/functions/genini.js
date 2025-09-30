// netlify/functions/gemini.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const body = JSON.parse(event.body);
    const userMsg = body.message || "";

    if (!userMsg) {
      return { statusCode: 400, body: "Falta el campo 'message'" };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: errorText };
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No hay respuesta";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}
