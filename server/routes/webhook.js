// server/routes/webhook.js  (replaces yesterday's version)
const express = require("express");
const crypto = require("crypto");
const { handleIncoming } = require("../services/bot");

const router = express.Router();

// --- GET: verification handshake (unchanged from Day 1) -------------------
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});


router.post("/", async (req, res) => {
  if (!verifySignature(req)) {
    console.warn("Invalid webhook signature -- rejecting");
    return res.sendStatus(401);
  }

  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    
    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      const contact = contacts?.[0];
      await handleIncoming(message, contact);
    }
  } catch (err) {
    
    console.error("Error handling webhook:", err);
  }
});

// --- HMAC signature check -------------------------------------------------
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.META_APP_SECRET)
      .update(req.rawBody)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

module.exports = router;