import express from 'express';
import cors from 'cors';
import { router as routes } from './routes';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

export default app;
