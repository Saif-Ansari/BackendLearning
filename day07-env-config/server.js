const express = require("express");
const config = require("./config");

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.get("/config-test", (req, res) => {
  res.json({
    port: config.port,
    isDev: config.isDev,
    allowedOrigins: config.allowedOrigins,
    // never return secrets like jwtSecret here — just showing config works
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
