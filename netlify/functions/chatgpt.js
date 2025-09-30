import fetch from "node-fetch";

export async function handler(event, context) {
  // ✅ Manejo de preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  // ✅ Solo aceptamos POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Método no permitido",
    };
  }

  try {
    // ✅ Leer el mensaje del usuario
    const body = JSON.parse(event.body);
    const userMsg = body.message || "";

    if (!userMsg) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: "Falta el campo 'message'",
      };
    }

    // ✅ Llamar a la API de OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // puedes cambiar a "gpt-4o-mini" o "gpt-3.5-turbo"
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7,
      }),
    });

    // ✅ Si la API devuelve error
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error OpenAI:", errorText);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: errorText }),
      };
    }

    // ✅ Procesar respuesta de OpenAI
    const data = await response.json();
    console.log("Respuesta OpenAI:", data); // 👈 visible en Netlify Logs

    const reply = data.choices?.[0]?.message?.content || "No hay respuesta";

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply }),
    };

  } catch (err) {
    console.error("Error servidor:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}

