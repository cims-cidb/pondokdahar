const express = require("express");
const r = express.Router();

r.get("/ping", (req, res) => res.json({ ok: true }));

module.exports = r;
