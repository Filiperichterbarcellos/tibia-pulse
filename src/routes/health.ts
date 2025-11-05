import { Router, Request, Response } from "express";
const r = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Checagem de saúde do serviço
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 */
r.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "tibia-pulse-backend" });
});

export default r;

// ---- test probe (mantém no fim do arquivo) ----
export const _healthProbe = () => 'ok';
