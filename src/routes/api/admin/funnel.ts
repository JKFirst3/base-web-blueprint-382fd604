import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/funnel")({
  server: { handlers: {
    GET: async ({ request }) => {
      const { adminSessionValid, adminApiHeaders } = await import("@/lib/admin/funnel-session.server");
      const headers = adminApiHeaders();
      if (!(await adminSessionValid(request))) return Response.json({ error: "unauthorized" }, { status: 401, headers });
      const { safePeriod, getFunnelDashboard } = await import("@/lib/admin/funnel-data.server");
      const days = safePeriod(new URL(request.url).searchParams.get("days"));
      return Response.json(await getFunnelDashboard(days), { headers });
    },
  } },
});
