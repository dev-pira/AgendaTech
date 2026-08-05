const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`[agendatech-backend] rodando em http://localhost:${port}`);
});
