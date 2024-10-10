const express = require("express");
const puppeteer = require("puppeteer");
const helmet = require("helmet");
const path = require("path");

const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname))); // Adicione isso

app.use(helmet());

// Rota para a raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota para verificar URL
app.get("/api/verificar", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL não fornecida." });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const requisitions = [];
    window.performance.getEntriesByType("resource").forEach((entry) => {
      requisitions.push({ url: entry.name, method: entry.initiatorType });
    });

    const scriptStatus =
      document.querySelector('script[src*="sizebay"]') !== null;
    const gtmStatus = !!window.dataLayer;
    const vtexIOStatus = !!window.vtex && !!window.vtex.sizing;

    return {
      requisitions,
      scriptStatus,
      gtmStatus,
      vtexIOStatus,
    };
  });

  await browser.close();
  res.json(data);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
