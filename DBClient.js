const { Pool } = require('pg');
const config = require('./config.json')

const connectionString = {
  user: config.DB_USERNAME,
  host: config.DB_HOST,
  database: config.DATABASE,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
};

const pool = new Pool(connectionString);

module.exports = pool;