import { createFileRoute } from "@tanstack/react-router";

// All security decisions are server-side; the client never sees the password/secret.
export const Route = createFileRoute("/api/admin/funnel-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { adminSessionValid, adminApiHeaders, isFunnelAdminConfigured } =
          await import("@/lib/admin/funnel-session.server");
        return Response.json(
          {
            authenticated: await adminSessionValid(request),
            configured: isFunnelAdminConfigured(),
          },
          { headers: adminApiHeaders() },
        );
      },
      POST: async ({ request }) => {
        const {
          checkFunnelPassword,
          issueFunnelSession,
          funnelSessionCookie,
          exactAdminOrigin,
          loginRateLimited,
          isFunnelAdminConfigured,
          adminApiHeaders,
        } = await import("@/lib/admin/funnel-session.server");
        const headers = adminApiHeaders();
        if (!exactAdminOrigin(request))
          return Response.json({ error: "forbidden" }, { status: 403, headers });
        if (!isFunnelAdminConfigured())
          return Response.json({ error: "not_configured" }, { status: 503, headers });
        if (loginRateLimited(request.headers.get("cf-connecting-ip")))
          return Response.json({ error: "rate_limited" }, { status: 429, headers });
        let password: unknown;
        try {
          const body = await request.text();
          if (body.length > 512)
            return Response.json({ error: "invalid" }, { status: 400, headers });
          password = (JSON.parse(body) as { password?: unknown }).password;
        } catch {
          return Response.json({ error: "invalid" }, { status: 400, headers });
        }
        if (!(await checkFunnelPassword(password)))
          return Response.json({ error: "invalid_credentials" }, { status: 401, headers });
        return Response.json(
          { authenticated: true },
          {
            headers: {
              ...headers,
              "set-cookie": funnelSessionCookie(request, await issueFunnelSession()),
            },
          },
        );
      },
      DELETE: async ({ request }) => {
        const { exactAdminOrigin, funnelSessionCookie, adminApiHeaders } =
          await import("@/lib/admin/funnel-session.server");
        const headers = adminApiHeaders();
        if (!exactAdminOrigin(request))
          return Response.json({ error: "forbidden" }, { status: 403, headers });
        return Response.json(
          { authenticated: false },
          { headers: { ...headers, "set-cookie": funnelSessionCookie(request, null) } },
        );
      },
    },
  },
});
