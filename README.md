# Verificador de Requisições

Este projeto foi criado com o intuito de auxiliar o time de suporte, permitindo verificar se os clientes estão fazendo requisições aos nossos serviços. Assim, conseguimos ter mais agilidade para identificar se a ferramenta está fora e também podemos identificar o tipo de implantação, se está sendo feita diretamente pelo código, via Google Tag Manager (GTM) ou pelo módulo VTEX IO.

## Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Node.js](https://nodejs.org/) - Para criar o servidor que gerencia as requisições.
- [Puppeteer](https://pptr.dev/) - Para acessar e interagir com páginas web em modo headless.
- HTML Vanilla - Utilizado para construir a interface do usuário simples.

## Instalação

Para executar este projeto localmente, siga os passos abaixo:

1. **Clone o repositório:**
   ```
   git clone https://github.com/AllanMicuanski/Simple-Request.git
   ```
   
   ```
   cd seu_repositorio
   ```

Instale as dependências:
   ```
npm install
   ```

Inicie o servidor:
   ```
node server.js
   ```

Acesse a aplicação: Abra seu navegador e vá para http://localhost:3000.

Uso
Para verificar uma URL, pesquise uma url de um cliente que utiliza nossos serviços e aguarde. Por exemplo:
"www.ecommerce-do-fulano.com.br"

A resposta conterá informações sobre as requisições feitas, o estado dos scripts implantados e o permalink (se disponível).

Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
