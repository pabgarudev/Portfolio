import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const CONTACT_TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || "pabgarudev@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  // Honeypot field, real users never see or fill it, spam bots usually do
  const company = typeof data.company === "string" ? data.company.trim() : "";

  if (company) {
    return jsonResponse({ success: true }, 200);
  }

  if (!name || !email || !message) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return jsonResponse({ error: "Input too long" }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ error: "Invalid email address" }, 400);
  }

  try {
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `${message}\n\nFrom: ${name} (${email})`,
    });

    if (error) {
      console.error("Resend error:", error);
      return jsonResponse({ error: "Failed to send message" }, 502);
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("Contact form error:", err);
    return jsonResponse({ error: "Failed to send message" }, 500);
  }
};
