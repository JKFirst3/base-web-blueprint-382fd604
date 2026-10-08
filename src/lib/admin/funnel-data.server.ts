import type { SupabaseClient } from "@supabase/supabase-js";
import { PREORDER_SOURCES } from "@/lib/campaign";
import { readMetaInsights, readPostHogEvents } from "./funnel-connectors.server";

export function safePeriod(value: unknown): 7 | 30 | 90 {
  return value === "7" || value === 7 ? 7 : value === "90" || value === 90 ? 90 : 30;
}

export async function getFunnelDashboard(days: 7 | 30 | 90) {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  // Count and paginated records are returned without email, phone, names or job titles.
  const meta = readMetaInsights(days);
  const posthog = readPostHogEvents(days);
  let database: {
    status: "ok" | "error"; leads: number | null; interviews: number | null;
    preorders: number | null; doiConfirmed: number | null; qualified: number | null;
    bySource: Array<{ source: string; count: number }>;
    recent: Array<{ id: string; date: string; product: string; source: string; doi: string; qualified: boolean }>;
  } = { status: "error", leads: null, interviews: null, preorders: null, doiConfirmed: null, qualified: null, bySource: [], recent: [] };
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Existing generated Database types predate the optional admin quality table.
    const db = supabaseAdmin as unknown as SupabaseClient;
    const count = async (table: string, col: string, val?: string, dateCol = "created_at") => {
      let q = db.from(table).select("*", { count: "exact", head: true }).gte(dateCol, start);
      if (val !== undefined) q = q.eq(col, val);
      const result = await q;
      if (result.error) throw new Error("count query failed");
      return result.count ?? 0;
    };
    const [leads, interviews, preorders, doiConfirmed, qualified, ...bySourceCounts] = await Promise.all([
      count("leads", "unused"),
      count("leads", "request_type", "interview"),
      count("preorders", "unused"),
      count("preorders", "doi_status", "confirmed"),
      count("lead_qualifications", "qualified", "true", "qualified_at"),
      ...PREORDER_SOURCES.map(s => count("preorders", "source", s)),
    ]);
    const { data: rec, error: recentError } = await db.from("preorders").select("id,created_at,solution_id,source,doi_status").gte("created_at", start).order("created_at", { ascending: false }).limit(50);
    if (recentError) throw new Error("recent query failed");
    const ids = (rec ?? []).map((x: Record<string, unknown>) => String(x.id));
    let checked = new Set<string>();
    if (ids.length) {
      const { data: quals, error: qualError } = await db.from("lead_qualifications").select("preorder_id").eq("qualified", true).in("preorder_id", ids);
      if (qualError) throw new Error("qualification query failed");
      checked = new Set((quals ?? []).map((x: Record<string, unknown>) => String(x.preorder_id)));
    }
    database = { status: "ok", leads, interviews, preorders, doiConfirmed, qualified,
      bySource: PREORDER_SOURCES.map((source,i) => ({ source, count: bySourceCounts[i] })),
      recent: (rec ?? []).map((x: Record<string, unknown>) => ({
        id: String(x.id), date: String(x.created_at), product: String(x.solution_id), source: String(x.source),
        doi: String(x.doi_status ?? "pending"), qualified: checked.has(String(x.id)),
      })),
    };
  } catch {
    // Never send service errors, environment variables or PII to the browser.
  }
  const [metaData, posthogData] = await Promise.all([meta, posthog]);
  return { days, generatedAt: new Date().toISOString(), meta: metaData, posthog: posthogData, database,
    // Not computable without campaign/source-level spend ↔ qualified-lead attribution.
    cpql: null, cpqlReason: "Meta-Kosten und qualifizierte Anfragen sind noch nicht kampagnenbezogen verknüpft.",
    notes: [
      "Meta-Zahlen sind Account-Insights; PostHog enthält nur Besucher mit Analytics-Einwilligung.",
      "Der bestehende request_type=termin umfasst auch Newsletter-Anmeldungen.",
      "Qualifiziert zählt nach Zeitpunkt der Qualifizierung, andere Supabase-Zahlen nach Anfrageerstellung.",
    ],
  };
}

export async function setPreorderQualification(id: string, qualified: boolean) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as SupabaseClient;
  const { data: existing, error: lookupError } = await db.from("preorders").select("id").eq("id", id).maybeSingle();
  if (lookupError || !existing) return false;
  const { error } = await db.from("lead_qualifications").upsert({ preorder_id: id, qualified,
    qualified_at: qualified ? new Date().toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: "preorder_id" });
  return !error;
}
