# BUPZO V10 - MASTER ARCHITECTURE & REQUIREMENTS SPECIFICATION

## 1. PROJECT OVERVIEW
**Name:** BUPZO
**Description:** An enterprise-grade, highly scalable e-commerce platform starting with Nagore specialties (Halwa, Dry fruits) and expanding to Toys, Home Appliances, etc.
**Architecture:** Monorepo with Dockerized Microservices (Local-First Development).
**Target Agent:** Read this document completely to generate the working code for Frontend, Backend, Database, MCP Server, and Integrations.

---

## 2. TECHNOLOGY STACK
*   **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn UI, Zustand (State Management), PWA enabled.
*   **Backend:** FastAPI (Python) for Core Business Logic.
*   **MCP Server:** Node.js (@modelcontextprotocol/sdk) for AI Agent Tools.
*   **Database:** PostgreSQL (via Supabase cloud, but local Docker PostgreSQL for development).
*   **Caching/Rate Limiting:** Redis (via Upstash cloud, but local Docker Redis for development).
*   **Containerization:** Docker & Docker Compose for local environment.
*   **AI Engine:** Google Gemini API.

---

## 3. UI/UX DESIGN & FRONTEND SPECIFICATIONS
*   **Theme & Style:** Skeuomorphic touches with realistic textures and shadows combined with a modern "Phoenix Dashboard" multi-vendor layout. Tone is techy and innovative.
*   **Color Palette (Mauve Serenity):** Charcoal (`#565264`), Dim Grey (`#706677`), Dusty Mauve (`#A6808C`), Almond Silk (`#CCB7AE`), and Dust Grey (`#D6CFCB`). Implement this using Tailwind CSS custom configuration.
*   **Typography:** 'Inter' for body text, 'Plus Jakarta Sans' for headings.
*   **Layout Structure:**
    *   Left sidebar navigation for both Customers and Sellers.
    *   Image slider / carousel hero rotating multiple slides.
    *   Compact section spacing with minimal padding between sections.
    *   Multi-column footer (links, about, contact, social).
*   **Interactive Features:**
    *   Dark / Light mode toggle & Responsive hamburger mobile menu.
    *   Smooth scroll navigation with scroll-triggered fade-in animations.
    *   Sticky call-to-action button, custom cursor effect, and preloader/loading animation.
    *   Image lightbox gallery, FAQ accordion, back to top button, and animated statistics counter.
    *   Dynamic Product Catalog Grid, Analytics Sales Charts, Refund Invoice Tracker, and AI Recommendation Widgets.

---

## 4. CORE BUSINESS LOGIC & FEATURES

### A. User Roles & Unified App
*   **Single Unified App:** Users and Sellers login to the same app. UI toggles based on role.
*   **Roles:** 
    1. `Customer` (Normal & Premium)
    2. `Seller` (Manages own inventory & orders)
    3. `Super Admin` (Global control, overrides, health monitoring)

### B. User Tiers & Wallet System
*   **Normal User:** Standard shipping, Ad-supported (Google AdSense/AdMob), ₹5 Referral Bonus.
*   **Premium User:** No Ads, 50% Flat Discount on Shipping, ₹10 Referral Bonus, 1% Cashback on purchases, Exclusive Combos.
*   **Wallet:** Users have a wallet balance. Refunds process directly to the wallet. *No withdrawal allowed* (ensures customer retention).

### C. Authentication & Security
*   **Primary Auth:** Mobile Number OTP via Firebase.
*   **Failover Auth:** WhatsApp OTP (Meta Cloud API) if SMS limits are reached.
*   **Biometrics:** WebAuthn (Fingerprint/FaceID) support for fast re-logins.
*   **Privacy:** Bank details are NOT stored in the database. Privacy policy consent checkbox is mandatory at signup.

### D. E-Commerce Engine
*   **Dynamic Categories:** Supports weights (for shipping calculations) and combo flags.
*   **Checkout:** 1-Click checkout, partial wallet payments, optional ₹2 "Trust Fund" donation checkbox.
*   **Reviews:** 1-5 Star ratings with comments.

---

## 5. INTEGRATIONS & MULTI-AGGREGATORS

### A. Payment Gateways (Multi-Routing)
*   **Aggregators:** Razorpay, Cashfree, PhonePe.
*   **Logic:** Dynamic routing to the gateway with the lowest fee or highest uptime.

### B. Shipping Partners (Multi-Routing)
*   **Aggregators:** Shiprocket, NimbusPost, Delhivery.
*   **Logic:** Rate comparison based on Pincode and Weight. NimbusPost for international, Delhivery for rural, Shiprocket for standard domestic.

### C. Omni-Channel Notifications
*   **Web Customers:** Order confirmation and updates via **WhatsApp** (Meta Cloud API) and Email (Brevo).
*   **App Customers & Sellers:** Real-time **Push Notifications** (Firebase FCM) & WebSockets.

---

## 6. DATABASE SCHEMA REQUIREMENTS (PostgreSQL)
The AI Agent must generate the initial SQL migration script including:
*   `users`: id, phone, email, is_premium, signup_platform (WEB/APP), referred_by, wallet_balance, privacy_accepted.
*   `categories`: id, name.
*   `products`: id, name, category_id, price, weight_grams, image_url, is_combo, stock_quantity, seller_id.
*   `orders`: id, user_id, total_amount, status, tracking_id, order_source (WEB/APP), shipping_partner, payment_gateway.
*   `wallet_transactions`: id, user_id, amount, type (REFERRAL, PURCHASE, TOPUP, REFUND).
*   `payment_logs` & `shipping_logs`: For super admin analytics.

---

## 7. SYSTEM ARCHITECTURE & DOCKER COMPOSE
The AI must create a `docker-compose.yml` with specific port mappings to avoid any local port conflicts:
1.  **db**: `postgres:13` container (Mapped to host port 5434 to avoid 5432 conflicts).
2.  **redis**: `redis:7` container (Mapped to host port 6380 to avoid 6379 conflicts).
3.  **backend-api**: FastAPI container (Mapped to host port 8003) connected to `db` and `redis`.
4.  **frontend-client**: Next.js container for Customer/Seller App (Mapped to host port 3003 to avoid 3000 conflicts).
5.  **mcp-server**: Node.js container for the AI context tools (Mapped to host port 3004).
*Strictly use these alternate ports across package.json, Dockerfiles, and docker-compose.yml to prevent "port already allocated" issues during local development.*

---

## 8. AI AGENT & MCP INTEGRATION
*   **Mistral AI / Gemini AI** acts as the chatbot, automated marketing copy generator, and smart search engine.
*   **MCP Server (`bupzomcp/index.js`)** is already included in the `docker-compose.yml`. It must be updated to connect to the actual local PostgreSQL database using the `DATABASE_URL` environment variable.
*   It must expose tools via plain Zod objects:
    *   `get_shipping_rates` (calculates across the 3 aggregators).
    *   `get_bupzo_orders` (fetches real order status from the PostgreSQL DB instead of returning mock data).
    *   `send_whatsapp_update` (triggers Meta API).

---

## 9. DEVOPS & CI/CD PIPELINE (FUTURE CLOUD PHASE)
*   Code must be structured for GitHub Actions.
*   `.github/workflows/deploy.yml` will handle Terraform provisioning (Vercel, Supabase).
*   All API keys (GEMINI_API_KEY, WHATSAPP_API_TOKEN, SUPABASE_URL, etc.) must be strictly loaded via `.env` locally and GitHub Secrets in production.

---

## 10. AI AGENT TASK INSTRUCTIONS (ACTION REQUIRED)
As an AI Assistant reading this file, please execute the following steps incrementally to build a fully working local system:

1.  **Step 1:** Generate the complete `docker-compose.yml` and the `.env.example` file with all required keys.
2.  **Step 2:** Generate the exact `schema.sql` to initialize the PostgreSQL database with the tables mentioned above.
3.  **Step 3:** Generate the boilerplate FastAPI application (`main.py`, database connection, and basic endpoints for Auth, Products, and Wallet).
4.  **Step 4:** Build the Next.js `bupzofrontend` using Tailwind CSS and the *Mauve Serenity* color palette. Implement the Phoenix Dashboard layout with Left Sidebar, Dark Mode, and scroll animations. Connect it to the FastAPI backend.
5.  **Step 5:** Update the existing MCP Server (`bupzomcp/index.js`) to connect to the PostgreSQL database using `pg` (node-postgres) and replace all dummy data with actual database queries.



- PostgreSQL: `psql -h localhost -p 5434 -U bupzo_user -d bupzo_db`
- Redis: `redis-cli -h localhost -p 6380 PING`
- Backend: `http://localhost:8003`
- Frontend: `http://localhost:3003`
- MCP Server: `http://localhost:3004`
