import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Duniya!');
  console.log('Response sent');
});

export default app;
