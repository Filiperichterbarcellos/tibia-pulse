import express from "express";
import health from "../src/routes/health";
import request from "supertest";

describe("GET /health", () => {
  it("returns ok:true", async () => {
    const app = express().use("/health", health);
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });
});
