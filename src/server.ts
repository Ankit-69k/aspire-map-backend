import app from './app.ts';

const port = Number(process.env.PORT) || 8080;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server running on ${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
