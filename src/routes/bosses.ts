import { Router, Request, Response } from "express";
const r = Router();

type Boss = { id: string; name: string; rarity: "common"|"rare"|"very-rare" };

/**
 * @openapi
 * /api/bosses:
 *   get:
 *     summary: Lista bosses
 *     tags: [Bosses]
 *     responses:
 *       200: { description: OK }
 */
r.get("/", (_req: Request, res: Response) => {
  const bosses: Boss[] = [{ id: "orshabaal", name: "Orshabaal", rarity: "very-rare" }];
  res.json(bosses);
});

/**
 * @openapi
 * /api/bosses/{id}:
 *   get:
 *     summary: Detalhe do boss
 *     tags: [Bosses]
 */
r.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (id !== "orshabaal") return res.status(404).json({ error: "not found" });
  res.json({ id, name: "Orshabaal", rarity: "very-rare" } as Boss);
});

export default r;
