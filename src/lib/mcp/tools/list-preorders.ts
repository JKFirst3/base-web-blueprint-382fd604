import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../admin";

export default defineTool({
  name: "list_preorders",
  title: "Vorbestellungen auflisten",
  description:
    "Listet die neuesten Vorbestellungen inklusive Lösung, Variante, Preis und Zahlungsart. Erfordert die Admin-Rolle.",
  inputSchema: {
    limit: z.number().int().describe("Maximale Anzahl der Einträge (Standard 20, max. 100)").optional(),
    solution_id: z.string().describe("Optional auf eine Lösung filtern: mobile, cabinet oder one").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, solution_id }, ctx) => {
    const guard = await requireAdmin(ctx);
    if (!guard.ok) return guard.error;
    const take = Math.min(Math.max(Math.trunc(limit ?? 20), 1), 100);
    let query = guard.supabase
      .from("preorders")
      .select("id, created_at, name, email, solution_id, solution_name, tier, payment_type, price_eur, monthly_eur, marketing_consent, marketing_consent_at, source")
      .order("created_at", { ascending: false })
      .limit(take);
    if (solution_id) query = query.eq("solution_id", solution_id.trim().toLowerCase());
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { preorders: data ?? [] },
    };
  },
});
