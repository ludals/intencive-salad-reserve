const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/user");
const reservationRoutes = require("./routes/reservation");

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.send("Hello from Express backend!");
});

app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
