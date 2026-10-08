import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/funnel-qualification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { adminSessionValid, exactAdminOrigin, adminApiHeaders } =
          await import("@/lib/admin/funnel-session.server");
        const headers = adminApiHeaders();
        if (!(await adminSessionValid(request)))
          return Response.json({ error: "unauthorized" }, { status: 401, headers });
        if (!exactAdminOrigin(request))
          return Response.json({ error: "forbidden" }, { status: 403, headers });
        let data: unknown;
        try {
          const raw = await request.text();
          if (raw.length > 400)
            return Response.json({ error: "invalid" }, { status: 400, headers });
          data = JSON.parse(raw);
        } catch {
          return Response.json({ error: "invalid" }, { status: 400, headers });
        }
        const body = data as { id?: unknown; qualified?: unknown } | null;
        if (!body || typeof body.id !== "string" || typeof body.qualified !== "boolean")
          return Response.json({ error: "invalid" }, { status: 400, headers });
        const { setPreorderQualification } = await import("@/lib/admin/funnel-data.server");
        const ok = await setPreorderQualification(body.id, body.qualified);
        return Response.json({ saved: ok }, { status: ok ? 200 : 400, headers });
      },
    },
  },
});
