// src/routes/health.ts
import { Router } from "express";
const router = Router();

router.get("/", (_req, res) => {
  const payload = { ok: true }; // <— linha “nova” coberta pelo teste
  return res.status(200).json(payload);
});

export default router;
