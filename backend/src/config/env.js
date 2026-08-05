require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL,
};

if (!env.jwtSecret && nodeEnv !== 'test') {
  console.warn(
    '[config] JWT_SECRET não definido no .env — obrigatório antes de subir em produção.',
  );
}

module.exports = env;
