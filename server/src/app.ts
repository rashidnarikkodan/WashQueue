import express, { Express, Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req: Request, res: Response) => {
  res.send("WashQueue server is running");
});

export default app;
