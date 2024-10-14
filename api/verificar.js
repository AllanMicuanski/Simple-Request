const puppeteer = require("puppeteer");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL não fornecida." });
  }

  console.log("Iniciando verificação para a URL:", url);

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Navegador Puppeteer iniciado");

    const page = await browser.newPage();
    const requisitions = [];
    const deploymentStatus = {
      script: false,
      gtm: false,
      vtexIO: false,
    };

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const requestUrl = request.url();

      // Captura requisições que contenham "sizebay"
      if (requestUrl.includes("sizebay")) {
        requisitions.push({
          url: requestUrl,
          method: request.method(),
        });

        // Verificação de VTEX IO
        if (requestUrl.includes("vtex_module.js")) {
          deploymentStatus.vtexIO = true;
        }

        // Verificação de GTM via prescript.js
        if (requestUrl.includes("prescript.js")) {
          deploymentStatus.gtm = true;
        }
      }
      request.continue();
    });

    console.log("Indo para a URL", url);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Capturar permalink se disponível
    const permalink = await page.evaluate(() => {
      return window.SizebayPrescript
        ? window.SizebayPrescript().getPermalink()
        : null;
    });

    console.log("Permalink encontrado:", permalink);

    if (permalink && !deploymentStatus.gtm && !deploymentStatus.vtexIO) {
      deploymentStatus.script = true;
    }

    await browser.close();

    res.status(200).json({
      requisitions,
      scriptStatus: deploymentStatus.script,
      gtmStatus: deploymentStatus.gtm,
      vtexIOStatus: deploymentStatus.vtexIO,
      permalink,
    });
  } catch (error) {
    console.error("Erro ao processar a URL:", error);
    res.status(500).json({ error: "Erro ao processar a URL." });
  }
};
