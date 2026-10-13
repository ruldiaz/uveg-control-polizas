const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await db.query(
      "SELECT id, nombre FROM aseguradoras ORDER BY nombre ASC",
    );

    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
