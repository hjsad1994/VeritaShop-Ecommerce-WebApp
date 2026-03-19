const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing in backend/.env');
}

const parsedUrl = new URL(databaseUrl);
const caPath = path.join(__dirname, '..', 'global-bundle.pem');
const ssl = fs.existsSync(caPath)
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caPath, 'utf8'),
    }
  : {
      rejectUnauthorized: false,
    };

async function main() {
  const client = new Client({
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 5432),
    database: parsedUrl.pathname.replace(/^\//, ''),
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    ssl,
  });

  try {
    await client.connect();
    const version = await client.query('SELECT version()');
    const currentDatabase = await client.query('SELECT current_database()');

    console.log('Connected to AWS RDS successfully');
    console.log(`Database: ${currentDatabase.rows[0].current_database}`);
    console.log(version.rows[0].version);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('RDS connection failed:', error);
  process.exit(1);
});
