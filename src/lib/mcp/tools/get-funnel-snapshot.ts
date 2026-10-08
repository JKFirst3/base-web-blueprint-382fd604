import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../admin";

/** Secure, aggregate-only source for agentic CRO audits; no mutation tools. */
export default defineTool({
  name: "get_funnel_snapshot",
  title: "Funnel Kennzahlen abrufen",
  description:
    "Liest aggregierte LAVIDRO Funnel-Metriken aus Meta, PostHog und Supabase, ohne personenbezogene Felder. Admin-Rolle erforderlich.",
  inputSchema: { days: z.union([z.literal(7), z.literal(30), z.literal(90)]).optional() },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    const guard = await requireAdmin(ctx);
    if (!guard.ok) return guard.error;
    const { getFunnelDashboard } = await import("@/lib/admin/funnel-data.server");
    const data = await getFunnelDashboard(days ?? 30);
    // Keep personal lead identifiers out of all AI tools.
    const sanitized = { ...data, database: { ...data.database, recent: [] } };
    return {
      content: [{ type: "text", text: JSON.stringify(sanitized) }],
      structuredContent: sanitized,
    };
  },
});
