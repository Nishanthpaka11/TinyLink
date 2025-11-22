const pool = require("../config/db");
const dns = require("dns").promises;

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(url) {
  try {
    const u = new URL(url);

    // allow only http/https
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return false;
    }

    // must have hostname
    if (!u.hostname) return false;

    return true;
  } catch {
    return false;
  }
}

// Check if domain resolves via DNS
async function domainExists(hostname) {
  try {
    await dns.lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

async function generateUniqueCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  while (true) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const exists = await pool.query(
      "SELECT 1 FROM links WHERE code = $1",
      [code]
    );

    if (exists.rowCount === 0) return code;
  }
}

// /healthz – must return 200 and JSON { ok: true, version: "1.0" }
exports.healthCheck = (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
};

exports.createLink = async (req, res) => {
  try {
    const { url, code } = req.body;

    // 1) Basic URL validation
    if (!url || !isValidUrl(url)) {
      return res.status(400).send("Invalid URL");
    }

    // 2) DNS check
    const { hostname } = new URL(url);
    const domainOK = await domainExists(hostname);
    if (!domainOK) {
      return res.status(400).send("Domain does not exist");
    }

    let finalCode;

    if (code) {
      // 3) Validate custom code format
      if (!CODE_REGEX.test(code)) {
        return res
          .status(400)
          .send("Code must be 6–8 chars, letters/numbers only.");
      }

      // 4) Ensure custom code is globally unique (409 if exists)
      const existing = await pool.query(
        "SELECT 1 FROM links WHERE code = $1",
        [code]
      );

      if (existing.rowCount > 0) {
        return res.status(409).send("Code already exists");
      }

      finalCode = code;
    } else {
      // 5) Auto-generate unique code when none provided
      finalCode = await generateUniqueCode();
    }

    // 6) Insert link
    const result = await pool.query(
      `INSERT INTO links (code, url)
       VALUES ($1, $2)
       RETURNING code, url, total_clicks, last_clicked, created_at`,
      [finalCode, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create link error:", error);
    res.status(500).send("Server error");
  }
};

exports.listLinks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT code, url, total_clicks, last_clicked, created_at
       FROM links
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.getLinkStats = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT code, url, total_clicks, last_clicked, created_at
       FROM links
       WHERE code = $1`,
      [code]
    );

    if (result.rowCount === 0) return res.sendStatus(404);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query("DELETE FROM links WHERE code = $1", [
      code,
    ]);

    if (result.rowCount === 0) return res.sendStatus(404);

    res.sendStatus(204);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.redirectLink = async (req, res) => {
  try {
    const { code } = req.params;

    // avoid conflicts with /api and /healthz
    if (["api", "healthz"].includes(code)) {
      return res.sendStatus(404);
    }

    const result = await pool.query(
      "SELECT id, url FROM links WHERE code = $1",
      [code]
    );

    if (result.rowCount === 0) return res.sendStatus(404);

    const link = result.rows[0];

    await pool.query(
      `UPDATE links
         SET total_clicks = total_clicks + 1,
             last_clicked = NOW()
       WHERE id = $1`,
      [link.id]
    );

    res.redirect(302, link.url);
  } catch (error) {
    res.status(500).send("Server error");
  }
};
