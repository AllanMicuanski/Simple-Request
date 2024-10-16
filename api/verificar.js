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
      if (["image", "stylesheet", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        const requestUrl = request.url();

        if (requestUrl.includes("sizebay")) {
          requisitions.push({
            url: requestUrl,
            initiator: request.initiator(),
          });

          if (
            requestUrl.includes("vtex_module.js") ||
            requestUrl.includes("vtexassets")
          ) {
            deploymentStatus.vtexIO = true;
          }

          if (requisitions[0].initiator.type === "script") {
            deploymentStatus.gtm = true;
          }

          if (requisitions[0].initiator.type === "parser") {
            deploymentStatus.script = true;
          }
        }
        request.continue();
      }
    });

    console.log("Indo para a URL", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const permalink = await page.evaluate(() => {
      return window.SizebayPrescript
        ? window.SizebayPrescript().getPermalink()
        : null;
    });

    console.log("Permalink encontrado:", permalink);

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
