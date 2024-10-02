import './dotenv-config';
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { zkDemoHandler } from './routes/zk-demo.js';

const app = express();
const port = 3001;

const corsOptions: CorsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.post('/zk-demo', zkDemoHandler);

app.get('/', (req, res) => {
  res.json({ staus: 'ok' });
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
