document.getElementById("verifyButton").onclick = async () => {
  const url = document.getElementById("urlInput").value;
  const messageEl = document.getElementById("message");
  const permalinkEl = document.getElementById("permalink");
  const resultsEl = document.getElementById("results");
  const deploymentStatusEl = document.getElementById("deploymentStatus");

  // Resetar os conteúdos das mensagens e resultados
  messageEl.textContent = "Verificando...";
  resultsEl.innerHTML = "";
  permalinkEl.innerHTML = "";
  deploymentStatusEl.innerHTML = "";

  try {
    // Fazer a requisição para o servidor
    const response = await fetch(
      `/api/verificar?url=${encodeURIComponent(url)}`
    );
    console.log("Resposta recebida do servidor:", response);

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error("Erro na resposta: " + response.statusText);
    }

    const data = await response.json();
    console.log("Dados recebidos:", data);

    messageEl.textContent = "";

    // Exibir permalink, se disponível
    if (data.permalink) {
      permalinkEl.innerHTML = `<strong>Permalink encontrado:</strong> <a href="${data.permalink}" target="_blank" rel="noopener noreferrer">${data.permalink}</a>`;
    }

    // Filtrar e exibir apenas requisições que contenham "sizebay"
    const filteredRequests = data.requisitions.filter((req) =>
      req.url.includes("sizebay")
    );

    // Exibir status de implantação (Script, GTM, VTEX IO)
    deploymentStatusEl.innerHTML = `
      <h3>Status de Implantação:</h3>
      <ul>
        <li>Script: ${data.scriptStatus ? "✅" : "❌"}</li>
        <li>GTM: ${data.gtmStatus ? "✅" : "❌"}</li>
        <li>VTEX IO: ${data.vtexIOStatus ? "✅" : "❌"}</li>
      </ul>
    `;
  } catch (error) {
    // Exibir mensagem de erro
    messageEl.textContent = error.message || "Ocorreu um erro.";
    console.error("Erro:", error);
  }
};
