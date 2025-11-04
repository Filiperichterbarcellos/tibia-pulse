import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import health from "./routes/health";
import bosses from "./routes/bosses";
import market from "./routes/market";
import calculator from "./routes/calculator";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/health", health);
app.use("/api/bosses", bosses);
app.use("/api/market", market);
app.use("/api/calculator", calculator);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`BE up on :${port} — docs em /docs`));
