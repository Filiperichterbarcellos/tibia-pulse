import { Router, Request, Response } from "express";
const r = Router();

r.get("/tibia-coin", (req: Request, res: Response) => {
  const price = Number(req.query.price ?? 0);
  const tc = Number(req.query.tc ?? 1);
  if (!Number.isFinite(price) || !Number.isFinite(tc) || tc <= 0) {
    return res.status(400).json({ error: "invalid params" });
  }
  res.json({ coins: Math.ceil(price / tc) });
});

export default r;
