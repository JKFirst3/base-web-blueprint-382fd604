import { defineTool } from "@lovable.dev/mcp-js";

const CATALOG = [
  {
    solution_id: "mobile",
    brand: "Lavidro Mobile",
    name: "Mobiler Wäscheassistent",
    description:
      "Mobiler Assistent, der Wäsche sortiert, be- und entlädt und zusammenlegt.",
    tiers: [
      { tier: "basic", price_eur: 9000, monthly_eur: 270 },
      { tier: "premium", price_eur: 14000, monthly_eur: 420 },
    ],
  },
  {
    solution_id: "cabinet",
    brand: "Lavidro Cabinet",
    name: "Autonomer Wäscheschrank",
    description:
      "Integrierter Wäscheschrank, der den kompletten Wäscheprozess im Hintergrund erledigt.",
    tiers: [
      { tier: "basic", price_eur: 12500, monthly_eur: 375 },
      { tier: "premium", price_eur: 21500, monthly_eur: 645 },
    ],
  },
  {
    solution_id: "one",
    brand: "Lavidro One",
    name: "Einzelteilbehandlung im Schrank",
    description:
      "Roboterarm im Schrank zur gezielten Fleckenbehandlung und zum Auffrischen einzelner Kleidungsstücke.",
    tiers: [{ tier: "standard", price_eur: 10000, monthly_eur: 300 }],
  },
];

export default defineTool({
  name: "get_product_catalog",
  title: "Produktkatalog abrufen",
  description:
    "Liefert die Lavidro Lösungen mit Varianten, Kaufpreisen und monatlichen Raten in Euro.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(CATALOG, null, 2) }],
    structuredContent: { products: CATALOG },
  }),
});
