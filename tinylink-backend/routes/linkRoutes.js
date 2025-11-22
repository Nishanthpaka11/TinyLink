const express = require("express");
const router = express.Router();

const {
  healthCheck,
  createLink,
  listLinks,
  getLinkStats,
  deleteLink,
  redirectLink,
} = require("../controllers/linkController");

// Health
router.get("/healthz", healthCheck);

// API
router.post("/api/links", createLink);
router.get("/api/links", listLinks);
router.get("/api/links/:code", getLinkStats);
router.delete("/api/links/:code", deleteLink);

// Redirect (must be last)
router.get("/:code", redirectLink);

module.exports = router;
