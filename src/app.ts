import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  llmRoutes,
  profileRoutes,
  studentRoutes,
  careerRoutes,
} from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Response sent');
  res.send('Hello Duniya!');
});

app.get('/health', (req, res) => {
  logger.info('Health check OK');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  logger.info('API endpoint hit');
  res.status(200).json({ message: 'API is working!' });
});

app.use('/student', studentRoutes);
app.use('/llm', llmRoutes);
app.use('/profile', profileRoutes);
app.use('/career', careerRoutes);

export default app;
