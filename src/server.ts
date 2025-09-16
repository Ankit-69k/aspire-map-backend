import app from "./app.ts";

const port = process.env.PORT || "8080";

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});
