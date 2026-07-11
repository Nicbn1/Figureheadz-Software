import { ReplitConnectors } from "@replit/connectors-sdk";
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

/**
 * Sends a Contact Us submission to the store inbox via the Resend connector.
 * Never cache the connectors client -- credentials are refreshed per call.
 */
export async function sendContactMessageEmail(input: ContactMessageInput): Promise<void> {
  const connectors = new ReplitConnectors();

  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: {
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
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Failed to send contact message email");
    throw new Error(`Resend request failed with status ${response.status}`);
  }
}
