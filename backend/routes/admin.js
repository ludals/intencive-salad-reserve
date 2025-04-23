const express = require("express");
const router = express.Router();
const db = require("../db");

// 관리자 메뉴 조회
router.get("/menu", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM menus ORDER BY weekday ASC");
  res.json(rows);
});

// 관리자 메뉴 수정
router.patch("/menu", async (req, res) => {
  const { day, menu } = req.body;
  await db.query("REPLACE INTO menus (weekday, menu) VALUES (?, ?)", [
    day,
    menu,
  ]);
  res.send("메뉴 업데이트 완료");
});

// 특정 날짜 예약자 목록
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

// 공지사항 가져오기
router.get("/notice", async (req, res) => {
  const [rows] = await db.query("SELECT content FROM notices WHERE id = 1");
  res.json(rows[0]);
});

// 공지사항 수정
router.patch("/notice", async (req, res) => {
  const { content } = req.body;
  await db.query("REPLACE INTO notices (id, content) VALUES (1, ?)", [content]);
  res.send("공지사항 업데이트 완료");
});

module.exports = router;
