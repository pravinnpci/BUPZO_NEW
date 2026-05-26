require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Error connecting to the database', err);
  }
}

app.post('/api/get_shipping_rates', async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const query = `
      SELECT shipping_cost, courier_partner, delivery_status
      FROM shipping_logs
      WHERE order_id = $1
    `;
    const result = await client.query(query, [order_id]);

    if (result.rows.length === 0) {
      return res.json({ shipping_cost: 0, courier_partner: 'N/A', delivery_status: 'N/A' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting shipping rates:', err);
    res.status(500).json({ error: 'Failed to get shipping rates' });
  }
});

app.post('/api/get_bupzo_orders', async (req, res) => {
  try {
    const { user_id, seller_id, status, limit = 10 } = req.body;

    let query = `
      SELECT id, user_id, seller_id, total_amount, status, created_at
      FROM orders
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND user_id = $1';
      params.push(user_id);
    }

    if (seller_id) {
      query += ' AND seller_id = $2';
      params.push(seller_id);
    }

    if (status) {
      query += ' AND status = $3';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $4';
    params.push(limit);

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting orders:', err);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

app.post('/api/send_whatsapp_update', async (req, res) => {
  try {
    const { phone_number, message } = req.body;

    if (!phone_number || !message) {
      return res.status(400).json({ error: 'phone_number and message are required' });
    }

    console.log(`Sending WhatsApp message to ${phone_number}: ${message}`);
    res.json({ success: true, message: 'WhatsApp message sent' });
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

app.post('/api/get_product_recommendations', async (req, res) => {
  try {
    const { user_id, limit = 5 } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const viewQuery = `
      SELECT product_id
      FROM product_views
      WHERE user_id = $1
      ORDER BY viewed_at DESC
      LIMIT 5
    `;
    const viewResult = await client.query(viewQuery, [user_id]);

    const productIds = viewResult.rows.map(row => row.product_id);

    let query = `
      SELECT p.id, p.name, p.price, p.image_url
      FROM products p
      WHERE p.id NOT IN ($${productIds.map((_, i) => i + 1).join(', $')})
      ORDER BY RANDOM()
      LIMIT $${productIds.length + 1}
    `;
    const params = [...productIds, limit];

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting product recommendations:', err);
    res.status(500).json({ error: 'Failed to get product recommendations' });
  }
});

app.post('/api/get_seller_products', async (req, res) => {
  try {
    const { seller_id, limit = 10 } = req.body;

    if (!seller_id) {
      return res.status(400).json({ error: 'seller_id is required' });
    }

    const query = `
      SELECT p.id, p.name, p.price, p.image_url, p.stock_quantity
      FROM products p
      WHERE p.seller_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2
    `;
    const result = await client.query(query, [seller_id, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting seller products:', err);
    res.status(500).json({ error: 'Failed to get seller products' });
  }
});

app.post('/api/get_banner_images', async (req, res) => {
  try {
    const { limit = 5 } = req.body;

    const query = `
      SELECT id, image_url, title, description, link_url
      FROM banners
      WHERE is_active = TRUE
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting banner images:', err);
    res.status(500).json({ error: 'Failed to get banner images' });
  }
});

app.post('/api/get_flash_sale_products', async (req, res) => {
  try {
    const { limit = 5 } = req.body;

    const query = `
      SELECT p.id, p.name, p.price, p.image_url, fs.discount_percent
      FROM products p
      JOIN flash_sales fs ON p.id = fs.product_id
      WHERE fs.end_time > NOW()
      ORDER BY fs.start_time DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting flash sale products:', err);
    res.status(500).json({ error: 'Failed to get flash sale products' });
  }
});

app.post('/api/get_spin_win_reward', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const query = `
      SELECT id, reward_amount, status
      FROM spin_win_rewards
      WHERE user_id = $1 AND status = 'PENDING'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await client.query(query, [user_id]);

    if (result.rows.length === 0) {
      const randomReward = Math.floor(Math.random() * 90) + 10;

      const insertQuery = `
        INSERT INTO spin_win_rewards
        (id, user_id, reward_amount, status, created_at)
        VALUES
        (uuid_generate_v4(), $1, $2, 'PENDING', NOW())
        RETURNING id, reward_amount
      `;
      const insertResult = await client.query(insertQuery, [user_id, randomReward]);

      res.json({
        reward_id: insertResult.rows[0].id,
        reward_amount: insertResult.rows[0].reward_amount,
        status: 'PENDING',
        message: 'New spin win reward generated'
      });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error getting spin win reward:', err);
    res.status(500).json({ error: 'Failed to get spin win reward' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  connectToDatabase();
});