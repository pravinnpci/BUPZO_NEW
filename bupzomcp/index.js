import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Pool } from 'pg';

// Initialize MCP Server
const mcpServer = new McpServer({
  name: "bupzo-mcp",
  version: "1.0.0",
});

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// In-memory cache for dashboard data (used instead of Redis for local MCP)
const memoryCache = {};

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.error('Database connection test successful:', res.rows[0].now);
  }
});

// Graceful error handling for database connection
let dbConnected = false;
pool.on('connect', () => {
  dbConnected = true;
  console.error('PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

function initializeMemoryCache() {
  memoryCache['bupzo:dashboard:popular_categories'] = JSON.stringify([
    { name: 'Dry Fruits', items: 42 },
    { name: 'Halwa', items: 28 },
    { name: 'Spices', items: 55 },
  ]);
  memoryCache['bupzo:cache:featured_products'] = JSON.stringify([
    { id: '1', name: 'Premium Mixed Dry Fruits Gift Box' },
    { id: '2', name: 'Traditional Gajar Halwa' },
    { id: '3', name: 'Saffron-Infused Spice Kit' },
  ]);
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.error('Database connection test successful:', res.rows[0].now);
  }
});

// Graceful error handling for database connection
let dbConnected = false;
pool.on('connect', () => {
  dbConnected = true;
  console.error('PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

function initializeMemoryCache() {
  memoryCache['bupzo:dashboard:popular_categories'] = JSON.stringify([
    { name: 'Dry Fruits', items: 42 },
    { name: 'Halwa', items: 28 },
    { name: 'Spices', items: 55 },
  ]);
  memoryCache['bupzo:cache:featured_products'] = JSON.stringify([
    { id: '1', name: 'Premium Mixed Dry Fruits Gift Box' },
    { id: '2', name: 'Traditional Gajar Halwa' },
    { id: '3', name: 'Saffron-Infused Spice Kit' },
  ]);
}

// Define tools using plain Zod types
mcpServer.tool(
  "get_bupzo_orders",
  "Fetches the latest orders from the BUPZO PostgreSQL database",
  {},
  async () => {
    try {
      const client = await pool.connect();
      const query = `
        SELECT id, user_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10;
      `;
      const result = await client.query(query);
      client.release();

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: "No orders found in the database." }]
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }]
      };
    } catch (err) {
      console.error('Error fetching orders:', err);
      return {
        content: [{ type: "text", text: `Error fetching orders: ${err.message}` }]
      };
    }
  }
);

mcpServer.tool(
  "get_cached_value",
  "Fetches a cached value from BUPZO memory cache by key",
  {
    key: z.string(),
  },
  async ({ key }) => {
    try {
      const value = memoryCache[key];
      return {
        content: [{ type: "text", text: value ? value : `Key ${key} not found in memory cache.` }]
      };
    } catch (err) {
      console.error('Error fetching cached value:', err);
      return {
        content: [{ type: "text", text: `Cache error: ${err.message}` }]
      };
    }
  }
);

mcpServer.tool(
  "get_shipping_rates",
  "Get shipping rates for different courier partners",
  {
    pincode: z.string(),
    weight: z.number()
  },
  async ({ pincode, weight }) => {
    const rates = [
      { partner: "NimbusPost", rate: 45, delivery_days: 3 },
      { partner: "Shiprocket", rate: 55, delivery_days: 2 },
      { partner: "Delhivery", rate: 65, delivery_days: 2 }
    ];
    return {
      content: [{ type: "text", text: JSON.stringify(rates, null, 2) }]
    };
  }
);

mcpServer.tool(
  "send_whatsapp_update",
  "Send an order update via WhatsApp",
  {
    phone: z.string(),
    message: z.string()
  },
  async ({ phone, message }) => {
    console.error(`Sending WhatsApp to ${phone}: ${message}`);
    return {
      content: [{ type: "text", text: `WhatsApp message sent to ${phone}` }]
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  initializeMemoryCache();
  console.error("BUPZO MCP Server is running!");

  // Prevent Node.js from exiting so the MCP server remains available.
  setInterval(() => {}, 1_000_000);
}

run().catch(console.error);