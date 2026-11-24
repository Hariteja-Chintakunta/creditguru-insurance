// POST /api/policies — admin records a policy in the tracker (the
// "Track Policies" module: policy number, company, source website,
// broker, product, customer contact, premium, dates, status, notes,
// document).
// GET /api/policies?company=&source_website=&broker=&product_type=&status=&q=
// — filtered policy list for the tracker + renewals views.
// Both ADMIN ONLY (customer personal data).

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/supabase-auth";
import { adminNotify } from "@/lib/email";
import { adminPolicyPurchased } from "@/lib/email-templates";
import { BROKERS, DOC_TYPES, POLICY_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function sanitizeSearch(q: string): string {
  return q.replace(/[,()%]/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      policy_number,
      company_name,
      source_website,
      broker,
      broker_other,
      product_type,
      customer_name,
      customer_email,
      customer_mobile,
      premium_amount,
      coverage_amount,
      start_date,
      expiry_date,
      status,
      notes,
      document,
    } = body as Record<string, unknown>;

    const missing: string[] = [];
    if (!policy_number || typeof policy_number !== "string")
      missing.push("policy_number");
    if (!company_name || typeof company_name !== "string")
      missing.push("company_name");
    if (!source_website || typeof source_website !== "string")
      missing.push("source_website");
    if (!product_type || typeof product_type !== "string")
      missing.push("product_type");
    if (!customer_name || typeof customer_name !== "string")
      missing.push("customer_name");
    if (!customer_email || typeof customer_email !== "string")
      missing.push("customer_email");
    if (!customer_mobile || typeof customer_mobile !== "string")
      missing.push("customer_mobile");
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      status !== null &&
      !(POLICY_STATUSES as readonly string[]).includes(status as string)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid status. Must be one of: ${POLICY_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Broker is optional; when given it must be one of the known
    // brokers. broker_other is only kept when broker is "Other".
    const brokerValue =
      typeof broker === "string" && broker.trim() ? broker.trim() : null;
    if (
      brokerValue !== null &&
      !(BROKERS as readonly string[]).includes(brokerValue)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid broker. Must be one of: ${BROKERS.join(", ")}`,
        },
        { status: 400 }
      );
    }
    const brokerOtherValue =
      brokerValue === "Other" &&
      typeof broker_other === "string" &&
      broker_other.trim()
        ? broker_other.trim()
        : null;

    const supabase = getSupabaseAdmin();
    const { data: policy, error } = await supabase
      .from("policies")
      .insert({
        policy_number,
        company_name,
        source_website,
        broker: brokerValue,
        broker_other: brokerOtherValue,
        product_type,
        customer_name,
        customer_email,
        customer_mobile,
        premium_amount:
          premium_amount === undefined ||
          premium_amount === null ||
          premium_amount === ""
            ? null
            : Number(premium_amount),
        coverage_amount: coverage_amount ?? null,
        start_date: start_date ?? null,
        expiry_date: expiry_date ?? null,
        status: (status as string) || "Active",
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error || !policy) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Failed to create policy." },
        { status: 500 }
      );
    }

    // Optional document recorded with the policy (file name only — the
    // file itself is stored by the caller; storage_path stays null here).
    if (document && typeof document === "object") {
      const doc = document as Record<string, unknown>;
      if (doc.file_name && typeof doc.file_name === "string") {
        const docType =
          typeof doc.doc_type === "string" &&
          (DOC_TYPES as readonly string[]).includes(doc.doc_type)
            ? (doc.doc_type as string)
            : null;
        await supabase.from("documents").insert({
          policy_id: policy.id,
          lead_id: null,
          doc_type: docType,
          file_name: doc.file_name,
          storage_path: (doc.storage_path as string) ?? null,
        });
      }
    }

    try {
      const mail = adminPolicyPurchased(policy);
      await adminNotify(
        mail.subject,
        mail.html,
        "admin_policy_purchased"
      );
    } catch {
      // Email failure must not fail the policy record.
    }

    return NextResponse.json({ ok: true, policy }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return adminAuthErrorResponse(auth.status);

    const supabase = getSupabaseAdmin();
    const { searchParams } = request.nextUrl;
    const company = searchParams.get("company");
    const sourceWebsite = searchParams.get("source_website");
    const brokerParam = searchParams.get("broker");
    const productType = searchParams.get("product_type");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    let query = supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (company) query = query.eq("company_name", company);
    if (sourceWebsite) query = query.eq("source_website", sourceWebsite);
    if (brokerParam) query = query.eq("broker", brokerParam);
    if (productType) query = query.eq("product_type", productType);
    if (status) query = query.eq("status", status);
    if (q) {
      const safe = sanitizeSearch(q);
      if (safe) {
        query = query.or(
          `policy_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_mobile.ilike.%${safe}%,company_name.ilike.%${safe}%,broker.ilike.%${safe}%,broker_other.ilike.%${safe}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, policies: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
