const express = require("express");
const verificar = require("./api/verificar");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/verificar", verificar);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
