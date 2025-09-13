import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Hackathon API!');
});

// サーバー起動
app.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
});