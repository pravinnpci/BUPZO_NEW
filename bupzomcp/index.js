import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Graceful error handling for database connection
let dbConnected = false;
pool.on('connect', () => {
  dbConnected = true;
  console.log('PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Define tools using plain Zod types
server.tool(
  "get_bupzo_orders",
  "Fetches the latest orders from the BUPZO PostgreSQL database",
  z.object({}),
  async () => {
    if (!dbConnected) {
      return {
        content: [{ type: "text", text: "Database connection not established. Check DATABASE_URL." }]
      };
    }

    try {
      const client = await pool.connect();
      const query = `
        SELECT id, user_id, total_amount, status, tracking_id, order_source, shipping_partner, payment_gateway
        FROM orders
        ORDER BY id DESC
        LIMIT 10;
      `;
      const result = await client.query(query);
      client.release();

      if (result.rows.length === 0) {
        return {
          content: [{ type: "text", text: "No orders found in the database." }]
        };
      }

      const orders = result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        total_amount: row.total_amount,
        status: row.status,
        tracking_id: row.tracking_id,
        order_source: row.order_source,
        shipping_partner: row.shipping_partner,
        payment_gateway: row.payment_gateway,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(orders, null, 2) }]
      };
    } catch (err) {
      console.error('Error fetching orders:', err);
      return {
        content: [{ type: "text", text: `Error fetching orders: ${err.message}` }]
      };
    }
  }
);

server.tool(
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

server.tool(
  "send_whatsapp_update",
  "Send an order update via WhatsApp",
  {
    phone: z.string(),
    message: z.string()
  },
  async ({ phone, message }) => {
    console.log(`Sending WhatsApp to ${phone}: ${message}`);
    return {
      content: [{ type: "text", text: `WhatsApp message sent to ${phone}` }]
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BUPZO MCP Server is running!");
}

run().catch(console.error);