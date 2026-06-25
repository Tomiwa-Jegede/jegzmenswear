function requireSession(req, res, next) {
  const sessionId = req.header("x-session-id");
  if (!sessionId) {
    return res.status(400).json({ error: "Missing x-session-id header" });
  }
  req.sessionId = sessionId;
  next();
}

module.exports = requireSession;
