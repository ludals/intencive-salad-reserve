const express = require("express");
const app = express();
const PORT = 4000;

app.get("/api/hello", (req, res) => {
  res.send("Hello from Express backend!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
