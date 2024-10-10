const express = require("express");
const puppeteer = require("puppeteer");
const helmet = require("helmet");
const path = require("path");

const app = express(); // Aqui você define o 'app'
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

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const requisitions = [];
    const deploymentStatus = {
      script: false,
      gtm: false,
      vtexIO: false,
    };

    // Capturar requisições de rede
    page.on("request", (request) => {
      const requestUrl = request.url();

      // Filtra apenas requisições que contenham "sizebay"
      if (requestUrl.includes("sizebay")) {
        console.log(`Capturado (sizebay): ${requestUrl}`);
        requisitions.push({
          url: requestUrl,
          method: request.method(),
        });

        // Verificação de VTEX IO
        if (requestUrl.includes("vtex_module.js")) {
          deploymentStatus.vtexIO = true;
          console.log("Identificado VTEX IO: vtex_module.js encontrado.");
        }

        // Verificação de GTM via prescript.js
        if (requestUrl.includes("prescript.js")) {
          deploymentStatus.gtm = true;
          console.log(
            "Identificado Google Tag Manager: prescript.js encontrado."
          );
        }
      }
    });

    // Navegar para a URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Usar delay no Node.js para esperar por requisições adicionais (ex: 10 segundos)
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log("Esperando requisições...");

    // Verifica se o Sizebay está presente
    const permalink = await page.evaluate(() => {
      return window.SizebayPrescript
        ? window.SizebayPrescript().getPermalink()
        : null;
    });

    // Nova verificação do script baseado no permalink
    if (permalink && !deploymentStatus.gtm && !deploymentStatus.vtexIO) {
      deploymentStatus.script = true;
      console.log("Existe permalink, então é Script");
    }

    await browser.close();

    // Envia os dados obtidos de volta para o frontend
    res.json({
      requisitions,
      scriptStatus: deploymentStatus.script,
      gtmStatus: deploymentStatus.gtm,
      vtexIOStatus: deploymentStatus.vtexIO,
      permalink,
    });
  } catch (error) {
    console.error("Erro ao verificar a URL:", error);
    res.status(500).json({ error: "Erro ao processar a URL." });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
