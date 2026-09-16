import type { ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "./supabase";

export type AdminGuard =
  | { ok: true; supabase: ReturnType<typeof supabaseForUser> }
  | { ok: false; error: { content: [{ type: "text"; text: string }]; isError: true } };

function deny(text: string): AdminGuard {
  return { ok: false, error: { content: [{ type: "text", text }], isError: true } };
}

/** Verifies the caller is signed in and holds the admin role. */
export async function requireAdmin(ctx: ToolContext): Promise<AdminGuard> {
  if (!ctx.isAuthenticated()) return deny("Nicht angemeldet.");
  const supabase = supabaseForUser(ctx);
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.getUserId() as string)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return deny(`Rollenprüfung fehlgeschlagen: ${error.message}`);
  if (!data) return deny("Dieses Konto hat keine Admin-Rolle für Lavidro.");
  return { ok: true, supabase };
}
