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
