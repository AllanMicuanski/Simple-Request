const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path"); // Importar o módulo path para lidar com caminhos

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Rota para servir o HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota para verificar URL
app.get("/api/verify", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "URL não fornecida." });
  }

  let browser;
  const requisitions = [];

  try {
    console.log("Iniciando Puppeteer...");
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log(`Acessando a URL: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    page.on("request", (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes("sizebay")) {
        requisitions.push({
          url: requestUrl,
          method: request.method(),
        });
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    res.status(200).json({ requisitions });
  } catch (error) {
    console.error("Erro ao verificar URL:", error);
    res.status(500).json({ message: `Erro: ${error.message}` });
  } finally {
    if (browser) {
      await browser.close();
      console.log("Navegador Puppeteer fechado.");
    }
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
