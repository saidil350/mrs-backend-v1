import type { Lead } from "@/types";
import { getDb } from "./db";

function leadText(lead: Lead) {
  return [
    "Lead baru dari website MRS",
    `Nama: ${lead.name}`,
    `WhatsApp: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.company ? `Perusahaan: ${lead.company}` : null,
    lead.sourcePage ? `Sumber: ${lead.sourcePage}` : null,
    `Pesan: ${lead.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function recordNotification(leadId: string, channel: "telegram" | "email", status: string, recipient: string, error?: string) {
  await getDb().query(
    `INSERT INTO notifications (lead_id, channel, status, recipient, error, sent_at)
     VALUES ($1, $2, $3, $4, $5, CASE WHEN $3 = 'sent' THEN now() ELSE NULL END)`,
    [leadId, channel, status, recipient, error ?? null],
  );
}

async function sendTelegram(lead: Lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    await recordNotification(lead.id, "telegram", "skipped", chatId || "");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: leadText(lead),
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Telegram request failed");
    await recordNotification(lead.id, "telegram", "failed", chatId, error);
    return;
  }

  await recordNotification(lead.id, "telegram", "sent", chatId);
}

async function sendEmail(lead: Lead) {
  const host = process.env.SMTP_HOST;
  const to = process.env.SALES_NOTIFICATION_EMAIL;

  if (!host || !to) {
    await recordNotification(lead.id, "email", "skipped", to || "");
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "MRS CRM <no-reply@mrs.amanahapp.run>",
      to,
      subject: `Lead baru: ${lead.name}`,
      text: leadText(lead),
    });
    await recordNotification(lead.id, "email", "sent", to);
  } catch (error) {
    await recordNotification(lead.id, "email", "failed", to, error instanceof Error ? error.message : "Email failed");
  }
}

export async function notifyNewLead(lead: Lead) {
  await Promise.allSettled([sendTelegram(lead), sendEmail(lead)]);
}
