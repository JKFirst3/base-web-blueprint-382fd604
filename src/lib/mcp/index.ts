import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProductCatalog from "./tools/get-product-catalog";
import listLeads from "./tools/list-leads";
import listPreorders from "./tools/list-preorders";
import getFunnelSnapshot from "./tools/get-funnel-snapshot";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "lavidro",
  title: "LAVIDRO",
  version: "0.1.0",
  instructions:
    "Werkzeuge für die Lavidro Website. `get_product_catalog` liefert die Lösungen mit Preisen. `list_leads` und `list_preorders` geben Kontaktanfragen bzw. Vorbestellungen zurück und setzen ein angemeldetes Konto mit Admin-Rolle voraus.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProductCatalog, listLeads, listPreorders, getFunnelSnapshot],
});
