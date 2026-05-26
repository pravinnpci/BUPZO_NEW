require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, });
async function connectToDatabase() { try { await client.connect(); console.log('Connected to PostgreSQL database'); } catch (err) { console.error('Error connecting to the database', err); } }
app.get('/', (req, res) => res.send('MCP Server Live'));
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => { console.log(`MCP Server running on port ${PORT}`); connectToDatabase(); });
