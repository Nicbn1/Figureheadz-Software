import { logger } from "./logger";
import type { Order, OrderItem } from "@workspace/db";

const CONTACT_INBOX = "info@figureheadz.com";
const FULFILLMENT_TEAM = ["nbeni@figureheadz.com", "afarnum@figureheadz.com"];

interface ContactMessageInput {
  email: string;
  reason: string;
  message: string;
}

export interface OrderEmailInput {
  order: Order;
  items: OrderItem[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildOrderItemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(item.productName)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(item.variationName)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.unitPriceCents)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.lineTotalCents)}</td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">Product</th>
          <th style="padding:8px;text-align:left;">Variant</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Unit Price</th>
          <th style="padding:8px;text-align:right;">Line Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildOrderSummaryHtml(order: Order, items: OrderItem[], isReminder = false): string {
  const title = isReminder
    ? `⏰ Reminder: Order #${order.id} Still Needs Packing`
    : `📦 New Order #${order.id} — Ready to Pack`;

  const intro = isReminder
    ? `<p style="color:#c0392b;font-weight:bold;">This order was paid more than 3 days ago and its status has not been updated. Please action it as soon as possible.</p>`
    : `<p>A new order has been paid and is ready for packing.</p>`;

  return `
    <div style="font-family:sans-serif;max-width:680px;margin:0 auto;color:#222;">
      <h2 style="border-bottom:2px solid #111;padding-bottom:8px;">${title}</h2>
      ${intro}

      <h3>Customer</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(order.fullName)}<br/>
        <strong>Email:</strong> ${escapeHtml(order.email)}<br/>
        <strong>Order placed:</strong> ${order.createdAt.toUTCString()}
      </p>

      <h3>Ship To</h3>
      <p>
        ${escapeHtml(order.fullName)}<br/>
        ${escapeHtml(order.line1)}${order.line2 ? `<br/>${escapeHtml(order.line2)}` : ""}<br/>
        ${escapeHtml(order.city)}, ${escapeHtml(order.state)} ${escapeHtml(order.postalCode)}<br/>
        ${escapeHtml(order.country)}
      </p>

      <h3>Items</h3>
      ${buildOrderItemsTable(items)}

      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <tr>
          <td style="padding:4px;text-align:right;"><strong>Subtotal:</strong></td>
          <td style="padding:4px;text-align:right;width:120px;">${formatCents(order.subtotalCents)}</td>
        </tr>
        <tr>
          <td style="padding:4px;text-align:right;"><strong>Shipping:</strong></td>
          <td style="padding:4px;text-align:right;">${formatCents(order.shippingCents)}</td>
        </tr>
        <tr>
          <td style="padding:4px;text-align:right;"><strong>Tax:</strong></td>
          <td style="padding:4px;text-align:right;">${formatCents(order.taxCents)}</td>
        </tr>
        <tr style="font-size:1.1em;">
          <td style="padding:6px;text-align:right;border-top:2px solid #111;"><strong>Total:</strong></td>
          <td style="padding:6px;text-align:right;border-top:2px solid #111;"><strong>${formatCents(order.totalCents)}</strong></td>
        </tr>
      </table>

      <p style="margin-top:24px;font-size:0.85em;color:#666;">
        This email was sent automatically by the Figureheadz order system.
      </p>
    </div>`;
}

async function sendEmail(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  let response: Response;

  if (process.env["REPLIT_CONNECTORS_HOSTNAME"]) {
    const { ReplitConnectors } = await import("@replit/connectors-sdk");
    const connectors = new ReplitConnectors();
    response = await connectors.proxy("resend", "/emails", {
      method: "POST",
      body: payload,
    });
  } else {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required to send emails outside Replit");
    }
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Failed to send email");
    throw new Error(`Resend request failed with status ${response.status}`);
  }
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
 */
export async function sendContactMessageEmail(input: ContactMessageInput): Promise<void> {
  const payload = buildEmailPayload(input);
  await sendEmail(payload);
}

/**
 * Sends a new-order notification to the fulfillment team when an order is paid.
 */
export async function sendOrderConfirmationEmail(input: OrderEmailInput): Promise<void> {
  await sendEmail({
    from: "Figureheadz Orders <onboarding@resend.dev>",
    to: FULFILLMENT_TEAM,
    subject: `📦 New Order #${input.order.id} — ${input.order.fullName}`,
    html: buildOrderSummaryHtml(input.order, input.items),
  });
}

/**
 * Sends a packing reminder to the fulfillment team for orders whose status
 * has not changed in more than 3 days.
 */
export async function sendOrderReminderEmail(input: OrderEmailInput): Promise<void> {
  await sendEmail({
    from: "Figureheadz Orders <onboarding@resend.dev>",
    to: FULFILLMENT_TEAM,
    subject: `⏰ Reminder: Order #${input.order.id} Still Needs Packing — ${input.order.fullName}`,
    html: buildOrderSummaryHtml(input.order, input.items, true),
  });
}
