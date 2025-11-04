import express from "express";
import calculator from "../src/routes/calculator";
import request from "supertest";

describe("GET /api/calculator/tibia-coin", () => {
  const app = express().use("/api/calculator", calculator);

  it("computes coins", async () => {
    const res = await request(app)
      .get("/api/calculator/tibia-coin")
      .query({ price: 500000, tc: 25000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ coins: 20 });
  });

  it("400 on invalid params", async () => {
    const res = await request(app)
      .get("/api/calculator/tibia-coin")
      .query({ price: 500000, tc: 0 });
    expect(res.status).toBe(400);
  });
});
