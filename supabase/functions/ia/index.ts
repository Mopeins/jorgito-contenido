import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Puente seguro entre la app y Claude: la clave de Anthropic vive solo aquí (secreto ANTHROPIC_API_KEY)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: ok, error: e1 } = await sb.rpc("es_equipo");
  if (e1 || !ok) return json({ error: "Tu correo no está autorizado" }, 403);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "Falta configurar la clave de IA (ANTHROPIC_API_KEY)" }, 500);

  let body: { prompt?: string; image?: { data: string; media_type: string }; max_tokens?: number };
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }
  if (!body.prompt || body.prompt.length > 60000) return json({ error: "Falta el texto o es muy largo" }, 400);

  const content: unknown[] = [];
  if (body.image?.data) {
    if (body.image.data.length > 7_000_000) return json({ error: "Imagen muy pesada" }, 400);
    content.push({ type: "image", source: { type: "base64", media_type: body.image.media_type || "image/png", data: body.image.data } });
  }
  content.push({ type: "text", text: body.prompt });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
      max_tokens: Math.min(body.max_tokens ?? 4000, 8000),
      messages: [{ role: "user", content }],
    }),
  });
  const d = await r.json();
  if (!r.ok) return json({ error: d?.error?.message || "Error de la IA" }, 502);
  const text = (d.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  return json({ text });
});
