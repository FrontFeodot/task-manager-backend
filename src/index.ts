import path from "path";

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRoute from "./routes/login";
import boardRoute from "./routes/board/board";
import mongoConnect from "./common/utils/database";
import cookieParser from "cookie-parser";
import taskRouter from "./routes/board/task";
import columnRouter from "./routes/board/column";

const app: express.Application = express();

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cors());

app.use("/auth", loginRoute);

app.use("/board", boardRoute);

app.use("/task", taskRouter);
app.use("/column", columnRouter);

app.use((req, res) => {
  res.status(404), res.send("<h1>Page not found</h1>");
});

mongoConnect(() => {
  app.listen(4000);
  console.log("appStarted");
});
