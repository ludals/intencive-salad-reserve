const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { name, emp_id, department } = req.body;
  try {
    const [existing] = await db.query("SELECT * FROM users WHERE emp_id = ?", [
      emp_id,
    ]);
    if (existing.length > 0) {
      return res.status(200).json(existing[0]);
    }
    const [result] = await db.query(
      "INSERT INTO users (name, emp_id, department) VALUES (?, ?, ?)",
      [name, emp_id, department]
    );
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

module.exports = router;
