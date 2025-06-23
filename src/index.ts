import path from 'path';
import http from 'http';

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import loginRoute from './routes/login';
import boardRoute from './routes/board/board';
import mongoConnect from './common/utils/database';
import taskRouter from './routes/board/task';
import CustomResponse from './common/utils/error';
import { initSocket } from './common/socket';

const app: express.Application = express();

const allowedOrigins = [
  'https://frontfeodot-task-manager.netlify.app',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

const pingPong = (_: Request, res: Response) => {
  res.status(200).send(
    new CustomResponse({
      isSuccess: 1,
      message: 'pong',
    })
  );
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

app.get('/ping', pingPong);

app.use('/auth', loginRoute);

app.use('/board', boardRoute);

app.use('/task', taskRouter);

app.use((req, res) => {
  res.status(404), res.send('<h1>Page not found</h1>');
});

const server = http.createServer(app);

initSocket(server);

mongoConnect(() => {
  server.listen(process.env.PORT || 4000, () =>
    console.log(
      `[${process.env.NODE_ENV}] Server running on port ${process.env.PORT}`
    )
  );
});
