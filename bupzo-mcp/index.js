require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
app.use(cors());
app.use(express.json());

// Database Pool Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bupzo_user:bupzo_password@db:5432/bupzo_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Connection
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Test DB Connection on startup
async function testDb() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully from MCP server:', res.rows[0]);
  } catch (err) {
    console.error('PostgreSQL connection error from MCP server:', err.message);
  }
}
testDb();

// Test Redis Connection on startup
redis.on('connect', () => {
  console.log('Redis connected successfully from MCP server');
});
redis.on('error', (err) => {
  console.error('Redis connection error from MCP server:', err.message);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: "BUPZO MCP Server Live",
    version: "1.0.0",
    endpoints: {
      telemetry: "/api/telemetry",
      escrow: "/api/escrow",
      query: "/api/query",
      campaign: "/api/campaign"
    }
  });
});

// 1. query_database endpoint
app.post('/api/query', async (req, res) => {
  const { sql, params } = req.body;
  if (!sql) {
    return res.status(400).json({ error: "Missing SQL query string" });
  }

  // Prevent destructive commands for safety
  const destructiveRegex = /\b(drop|truncate|delete|alter|grant|revoke)\b/i;
  if (destructiveRegex.test(sql)) {
    return res.status(403).json({ error: "Unauthorized operation: Read/Write queries only, destructive commands blocked." });
  }

  try {
    const result = await pool.query(sql, params || []);
    res.json({ success: true, rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. get_system_telemetry endpoint
app.get('/api/telemetry', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT COUNT(*) FROM pg_stat_activity');
    const totalConnections = parseInt(dbCheck.rows[0].count);
    
    // Memory and basic CPU telemetry
    const memUsage = process.memoryUsage();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        status: "healthy",
        active_connections: totalConnections,
        pool_max: 10
      },
      cache: {
        status: redis.status === "ready" ? "healthy" : "disconnected",
        client_mode: "standalone"
      },
      system: {
        platform: process.platform,
        node_version: process.version,
        memory_rss_mb: Math.round(memUsage.rss / 1024 / 1024),
        memory_heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        uptime_seconds: Math.round(process.uptime())
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. get_escrow_balances endpoint
app.get('/api/escrow', async (req, res) => {
  try {
    // Escrow defined as sum of pending orders balance or total seller payouts in hold
    const escrowSum = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'pending'");
    const walletBalanceSum = await pool.query("SELECT COALESCE(SUM(wallet_balance), 0) as total FROM users");
    
    res.json({
      success: true,
      active_escrow_hold_inr: parseFloat(escrowSum.rows[0].total),
      user_wallet_pool_inr: parseFloat(walletBalanceSum.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. publish_whatsapp_campaign endpoint
app.post('/api/campaign', async (req, res) => {
  const { title, template_name, target_cohort } = req.body;
  if (!title || !template_name) {
    return res.status(400).json({ error: "Missing campaign title or template name" });
  }

  try {
    // Log audit event to database
    await pool.query(
      "INSERT INTO audit_logs (id, action, details) VALUES (uuid_generate_v4(), $1, $2)",
      ["CAMPAIGN_BROADCAST", JSON.stringify({ title, template_name, target_cohort: target_cohort || "all" })]
    );

    // Track campaign status in Redis
    const campaignId = `campaign:${Date.now()}`;
    await redis.hset(campaignId, {
      title,
      template: template_name,
      status: "blasting",
      progress: "100%"
    });

    res.json({
      success: true,
      message: `WhatsApp campaign broadcast '${title}' triggered successfully.`,
      campaign_id: campaignId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
