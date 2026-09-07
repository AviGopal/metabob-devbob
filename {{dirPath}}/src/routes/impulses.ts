import { Hono } from "hono";
export const impulsesRouter = new Hono();
impulsesRouter.post("/v2/impulses/resolve", async (c) => {
  const body = await c.req.json().catch(() => ({})) as any;
  const ptype = body?.impulse?.pointer?.type;
  if (!ptype) return c.json({ success: false, error: "pointer.type required" }, 400);
  switch (ptype) {
    // TODO: Add cases for {{advertisedShapes}}
    default:
      return c.json({ success: false, error: `unknown shape: ${ptype}` }, 400);
  }
});
