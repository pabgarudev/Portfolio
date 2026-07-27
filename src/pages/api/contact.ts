import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const CONTACT_TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || "pabgarudev@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ENGAGEMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time role",
  freelance: "Freelance",
  collab: "Collaboration",
  hi: "Just saying hi",
  other: "Something else",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // A plain (non-JS) form submission lands here as urlencoded/multipart instead
  // of JSON, e.g. when a mobile browser submits before the page's script has
  // attached its fetch handler. Support both so the message still goes out.
  const isFormPost = (request.headers.get("content-type") ?? "").includes("form");

  let data: Record<string, unknown>;
  try {
    if (isFormPost) {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    } else {
      data = await request.json();
    }
  } catch {
    return isFormPost
      ? redirectTo(request, "error")
      : jsonResponse({ error: "Invalid request body" }, 400);
  }

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  // Honeypot field, real users never see or fill it, spam bots usually do
  const company = typeof data.company === "string" ? data.company.trim() : "";
  const engagementType = typeof data.engagementType === "string" ? data.engagementType.trim() : "";
  const engagementLabel = ENGAGEMENT_LABELS[engagementType];

  if (company) {
    return isFormPost ? redirectTo(request, "success") : jsonResponse({ success: true }, 200);
  }

  if (!name || !email || !message) {
    return isFormPost
      ? redirectTo(request, "error")
      : jsonResponse({ error: "Missing required fields" }, 400);
  }

  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return isFormPost ? redirectTo(request, "error") : jsonResponse({ error: "Input too long" }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return isFormPost
      ? redirectTo(request, "error")
      : jsonResponse({ error: "Invalid email address" }, 400);
  }

  try {
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: engagementLabel ? `New message from ${name} (${engagementLabel})` : `New message from ${name}`,
      text: `${message}\n\nFrom: ${name} (${email})${engagementLabel ? `\nLooking for: ${engagementLabel}` : ""}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return isFormPost ? redirectTo(request, "error") : jsonResponse({ error: "Failed to send message" }, 502);
    }

    return isFormPost ? redirectTo(request, "success") : jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("Contact form error:", err);
    return isFormPost ? redirectTo(request, "error") : jsonResponse({ error: "Failed to send message" }, 500);
  }
};

function redirectTo(request: Request, status: "success" | "error") {
  const referer = request.headers.get("referer");
  const base = referer && referer.startsWith(new URL(request.url).origin) ? referer : "/";
  const url = new URL(base, request.url);
  url.searchParams.set("contact", status);
  return new Response(null, { status: 303, headers: { Location: url.pathname + url.search } });
}
