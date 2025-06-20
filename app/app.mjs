import express from "express";
import morgan from "morgan";
import cors from "cors";
import bot from "./lib/telegram.mjs";

const app = express();

app.use(morgan("dev"));

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  req.bot = bot;
  next();
});

app.use((req, res, next) => {
  console.log(`Unhandled HTTP request: ${req.method} ${req.url}`);
  res.status(404).send("Not Found");
});

export default app;
