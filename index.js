const { Pool } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mcp = require('@modelcontextprotocol/server');
const { getGenerativeModel } = require('./agent');

const pool = new Pool({
  user: 'bupzo_user',
  host: 'db',
  database: 'bupzo_db',
  password: 'bupzo_password',
  port: 5432,
});

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

pool.on('connect', () => { console.log('PostgreSQL connected'); });
pool.on('error', (err) => { console.error('PostgreSQL error:', err); });
redis.on('connect', () => { console.log('Redis connected'); });
redis.on('error', (err) => { console.error('Redis error:', err); });

const server = mcp.createServer({ model: getGenerativeModel(), tools: [] });
server.listen(3004, () => { console.log('MCP server running on port 3004'); });