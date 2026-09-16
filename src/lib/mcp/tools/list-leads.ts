import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin } from "../admin";

export default defineTool({
  name: "list_leads",
  title: "Kontaktanfragen auflisten",
  description:
    "Listet die neuesten Kontakt- und Interessensanfragen von der Lavidro Website. Erfordert die Admin-Rolle.",
  inputSchema: {
    limit: z.number().int().describe("Maximale Anzahl der Einträge (Standard 20, max. 100)").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const guard = await requireAdmin(ctx);
    if (!guard.ok) return guard.error;
    const take = Math.min(Math.max(Math.trunc(limit ?? 20), 1), 100);
    const { data, error } = await guard.supabase
      .from("leads")
      .select("id, created_at, name, email, phone, request_type, availability, pain_point")
      .order("created_at", { ascending: false })
      .limit(take);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
