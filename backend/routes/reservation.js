const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).send("user_id가 필요합니다");

  try {
    const [rows] = await db.query(
      "SELECT reserve_date, quantity FROM reservations WHERE user_id = ?",
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

router.post("/", async (req, res) => {
  const { user_id, reserve_date, quantity } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT * FROM reservations WHERE user_id = ? AND reserve_date = ?",
      [user_id, reserve_date]
    );
    if (existing.length > 0) {
      return res.status(400).send("이미 예약됨");
    }

    await db.query(
      "INSERT INTO reservations (user_id, reserve_date, quantity) VALUES (?, ?, ?)",
      [user_id, reserve_date, quantity]
    );
    res.status(201).send("예약 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

router.put("/", async (req, res) => {
  const { user_id, reserve_date, quantity } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE reservations SET quantity = ? WHERE user_id = ? AND reserve_date = ?",
      [quantity, user_id, reserve_date]
    );
    if (result.affectedRows === 0) return res.status(404).send("예약 없음");
    res.send("예약 변경 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

router.delete("/", async (req, res) => {
  const { user_id, reserve_date } = req.body;
  try {
    const [result] = await db.query(
      "DELETE FROM reservations WHERE user_id = ? AND reserve_date = ?",
      [user_id, reserve_date]
    );
    if (result.affectedRows === 0) return res.status(404).send("예약 없음");
    res.send("예약 취소 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

module.exports = router;
