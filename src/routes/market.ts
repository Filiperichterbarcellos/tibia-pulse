import { Router, Request, Response } from "express";
const r = Router();

r.get("/", (_req: Request, res: Response) => {
  res.json({ items: [] });
});

export default r;
