import 'dotenv/config';
import express from "express";
import type { Request, Response } from "express";

export const app = express();
app.use(express.json());


app.get("/", (request: Request, response: Response) => {
  response.json({
    msg: "Olá, mundo!"
  })
})
