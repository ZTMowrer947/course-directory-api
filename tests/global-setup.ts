import 'dotenv/config';

import mysql from 'mysql2/promise';

// Function to initialize MySQL connection
async function initConnection() {
  const url = new URL(process.env.DATABASE_URL!);

  return mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    port: Number.parseInt(url.port ?? '3306'),
  });
}

export async function setup() {
  const conn = await initConnection();

  // Create test database
  try {
    await conn.execute('CREATE DATABASE coursedir_test;');
  } finally {
    await conn.end();
  }
}

export async function teardown() {
  const conn = await initConnection();

  // Drop test database
  try {
    await conn.execute('DROP DATABASE coursedir_test;');
  } finally {
    await conn.end();
  }
}
