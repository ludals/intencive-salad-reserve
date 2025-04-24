const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/menu", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM menus ORDER BY weekday ASC");
  res.json(rows);
});

router.patch("/menu", async (req, res) => {
  const { day, menu } = req.body;
  await db.query("REPLACE INTO menus (weekday, menu) VALUES (?, ?)", [
    day,
    menu,
  ]);
  res.send("메뉴 업데이트 완료");
});

router.get("/reservations/:date", async (req, res) => {
  const { date } = req.params;
  const [rows] = await db.query(
    `SELECT u.name, u.emp_id, r.quantity FROM reservations r
     JOIN users u ON r.user_id = u.id
     WHERE r.reserve_date = ?`,
    [date]
  );
  res.json(rows);
});

module.exports = router;
