import { logger } from "./logger";

const CONTACT_INBOX = "info@figureheadz.com";

interface ContactMessageInput {
  email: string;
  reason: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailPayload(input: ContactMessageInput) {
  return {
    from: "Figureheadz Contact Form <onboarding@resend.dev>",
    to: [CONTACT_INBOX],
    reply_to: input.email,
    subject: `[Contact Us] ${input.reason}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Reason:</strong> ${escapeHtml(input.reason)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>
    `,
  };
}

/**
 * Sends a Contact Us submission to the store inbox via Resend.
 *
 * Two modes:
 *  - Replit: routes through the Replit connector proxy (REPLIT_CONNECTORS_HOSTNAME present)
 *  - Render / standalone: calls Resend directly using RESEND_API_KEY
 */
export async function sendContactMessageEmail(input: ContactMessageInput): Promise<void> {
  const payload = buildEmailPayload(input);

  let response: Response;

  if (process.env["REPLIT_CONNECTORS_HOSTNAME"]) {
    // Running inside Replit — use the managed connector proxy so tokens are
    // refreshed automatically without needing a raw API key.
    const { ReplitConnectors } = await import("@replit/connectors-sdk");
    // Never cache the connectors client — credentials expire.
    const connectors = new ReplitConnectors();
    response = await connectors.proxy("resend", "/emails", {
      method: "POST",
      body: payload,
    });
  } else {
    // Running outside Replit (e.g. Render) — use a plain API key.
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required to send emails outside Replit");
    }
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Failed to send contact message email");
    throw new Error(`Resend request failed with status ${response.status}`);
  }
}
