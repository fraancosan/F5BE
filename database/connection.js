import { Sequelize } from 'sequelize';
import 'dotenv/config';

const db = new Sequelize(
  process.env.DATABASE_DB,
  process.env.USER_DB,
  process.env.PASSWORD_DB,
  {
    host: process.env.HOST_DB,
    dialect: 'mysql',
    port: process.env.PORT_DB,
    logging: false,
    pool: {
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
      min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 0,
      acquire: process.env.DB_POOL_ACQUIRE
        ? parseInt(process.env.DB_POOL_ACQUIRE)
        : 30000,
      idle: process.env.DB_POOL_IDLE
        ? parseInt(process.env.DB_POOL_IDLE)
        : 10000,
    },
  },
);

async function testConnection() {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

await testConnection();

export default db;
