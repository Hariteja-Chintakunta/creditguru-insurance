// POST /api/contact — public contact form. Not stored in the database;
// the message goes straight to the admin inbox as an email
// (template "admin_new_lead", like other admin notifications).
// PUBLIC BY DESIGN: the website contact form; it returns no data.

import { NextRequest, NextResponse } from "next/server";
import { adminNotify, emailShell } from "@/lib/email";

export const dynamic = "force-dynamic";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { name, email, mobile, message } = body as Record<string, unknown>;

    const missing: string[] = [];
    if (!name || typeof name !== "string") missing.push("name");
    if (!email || typeof email !== "string") missing.push("email");
    if (!message || typeof message !== "string") missing.push("message");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const html = emailShell(
      "New contact message",
      `<p>You have a new message from the website contact form.</p>
<p><strong>Name:</strong> ${esc(name as string)}</p>
<p><strong>Email:</strong> ${esc(email as string)}</p>
${mobile ? `<p><strong>Mobile:</strong> ${esc(mobile as string)}</p>` : ""}
<p><strong>Message:</strong></p>
<p>${esc(message as string).replace(/\n/g, "<br>")}</p>`
    );

    await adminNotify(
      "New contact message — CreditGuru Insurance",
      html,
      "admin_new_lead"
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
