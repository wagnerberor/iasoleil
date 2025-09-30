import fetch from "node-fetch";

export async function handler(event, context) {
  if(event.httpMethod !== "POST") return { statusCode:405, body:"Método no permitido" };
  const body = JSON.parse(event.body);
  const userMsg = body.message || "";
  if(!userMsg) return { statusCode:400, body:"Falta el campo 'message'" };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model:"gpt-4o",
      messages:[{role:"user", content:userMsg}],
      temperature:0.7
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "No hay respuesta";

  return { statusCode:200, body: JSON.stringify({reply}) };
}

