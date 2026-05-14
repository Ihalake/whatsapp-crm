// heart of backend server .starts everything
require("dotenv").config();

const express =require("express");//define routes like /api/...
const cors =require("cors");
//separating logic
const webhookRoutes = require("./routes/webhook");
const app =express(); // creating server instance
app.use(cors()); // middleware instance

app.use(
    express.json({
        verify:(req,_res,buf) =>{
            req.rawBody =buf.toString("utf8");
        },
    })
);

app.use("/webhook", webhookRoutes);

app.use("/api/leads", (_req, res) =>
  res.status(501).json({ error: "Coming on Day 3" })
);
app.use("/api/stats", (_req, res) =>
  res.status(501).json({ error: "Coming on Day 3" })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//Global error handler

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
