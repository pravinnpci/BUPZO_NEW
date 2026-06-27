🚀 Banking-Grade · AI-Driven · Multi-Vendor
BUPZO
A production-ready, high-scale marketplace platform built with Next.js 15, FastAPI & PostgreSQL — architected as 8 microservices on Kubernetes, serving customers, sellers, and admins at 10-crore scale.

10Cr+
Target Users
8
Microservices
3
Stakeholders
99.9%
Uptime SLA
AI
MCP + pgvector
Core Platform Pillars
Five foundational systems that power BUPZO end-to-end
🤖
AI Integration Layer
MCP (Model Context Protocol) orchestrates multi-agent workflows. pgvector enables semantic product search. Mistral 7B via Ollama auto-generates descriptions, maps categories, adds SEO tags, and detects fraud — all autonomously.

MCP
pgvector
Ollama
LangChain
Fraud Detection
💰
Financial Hub
Escrow Wallet system holds funds until delivery confirmation. Smart multi-aggregator routing (Stripe / Razorpay) selects the best payment gateway based on success rate. Automated commission splitting and audit logs for every wallet change.

Escrow Wallet
Stripe
Razorpay
Auto-Split
🚚
Logistics Engine
AI-powered shipping aggregator selection by pincode, cost, and speed. Real-time order tracking with WebSocket updates. Reduces logistics overhead by routing to the most optimal courier at the time of order.

AI Routing
Pincode Logic
WebSocket
Real-time
📣
Marketing Automation
WhatsApp-first notification system via MCB Server (Twilio/Gupshup) sends OTPs and order updates. Firebase FCM for mobile push. Smart Promo & Voucher engine with tiered discount rules and auto-expiry.

WhatsApp
FCM
Vouchers
MCB Server
🛡️
Security & Access
JWT stateless auth with short-lived Access Tokens and long-lived Refresh Tokens. RBAC enforces Admin / Seller / Customer permission tiers. API Rate Limiting via Kong/Traefik prevents abuse at 10Cr scale. All transactions AES-256 encrypted.

JWT
RBAC
Rate Limiting
AES-256
⚙️
Operational Efficiency
PWA with offline capability for low-connectivity areas. CI/CD pipeline (GitHub Actions) for zero-downtime deployments. Disaster recovery via automated DB snapshots. Multi-language and multi-currency ready for global expansion.

PWA
CI/CD
Disaster Recovery
i18n
BUPZO Technical Foundation
Core design decisions for 10Cr+ scale
Pillar	Strategy	Technology	Status
Scalability	PostgreSQL Partitioning & TimescaleDB for 10Cr+ logs	Citus / PG Partitioning	Core
Routing	Smart Payment/Shipping Aggregator selection by cost & success rate	Custom Router Service	Core
Intelligence	Multi-Agent AI via MCP for dispute resolution & cataloging	Ollama + LangChain + MCP	AI
Security	JWT stateless auth + API Rate Limiting + RBAC	Kong/Traefik + JWT	Critical
Omni-channel	WhatsApp for efficiency, FCM for mobile engagement	Twilio/Gupshup + Firebase	Comms
Availability	Kubernetes orchestration with auto-scaling pods	k3s / Kind / Kubernetes	Infra


System Architecture — 8 Microservices on Kubernetes
Each service is independently dockerized and orchestrated via Kubernetes for production scaling
⬇ Client Layer
Next.js 15 PWA
Customer Site
Seller Dashboard
Next.js + Redux
Admin Panel
Phoenix UI
↓
⬇ API Gateway Layer
Kong / Traefik
Rate Limiting · Auth · Routing
Cloudflare Tunnel
DDoS Protection · CDN
Nginx Load Balancer
Internal Traffic
↓
⬇ Microservices Layer (Docker × 8)
Auth Service
JWT + RBAC
Product Service
AI Cataloging
Order Service
Tracking + WS
Payment Service
Escrow + Routing
Seller Service
KYC + Analytics
AI Engine
MCP + Ollama
Notification Svc
WA + FCM
Admin Service
Audit + Disputes
↓
⬇ Data Layer
PostgreSQL
pgvector + PostGIS
TimescaleDB
10Cr Logs / Events
Redis
Cache + Sessions
DB Sharding
Citus Partitioning
↓
⬇ Infrastructure & DevOps
Kubernetes
k3s / Kind
Docker Compose
8 Containers
GitHub Actions
CI/CD Pipeline
Snapshots
Disaster Recovery
CI/CD & Deployment Pipeline
From code push to production — automated
1
Code Push
GitHub PR merge
›
2
GH Actions
Lint + Test + Build
›
3
Docker Build
Image → Registry
›
4
K8s Deploy
Rolling update
›
5
Health Check
Readiness probe
›
6
Production
Live + monitored
Stakeholder Module Matrix
Stakeholder	Mobile App (PWA)	Website	Key AI Feature
Customer	Push notifications, Order tracking, Offline browsing	Large screen shopping, Invoice download, Wishlist	pgvector semantic product recommendations
Seller	Business alerts, Camera KYC upload, Quick restock	Detailed analytics, Stock management, Revenue charts	AI auto-cataloging (name → description → SEO)
Admin	Emergency notifications, Quick dispute flag	Full Command Center — Audit logs, Dispute resolution, Logistics routing, Financial audit	MCP dispute resolution agent + fraud sc

Admin Command Center — Phoenix UI (Vertical Nav)
Inspired by Phoenix v1.24.0 E-commerce Admin — dark sidebar, vertical navigation
BUPZO
MAIN MENU
📊
Dashboard
📦
Products
🛒
Orders
👤
Customers
🏪
Sellers
💰
Financials
🚚
Logistics
⚖️
Disputes
3
📋
Audit Logs
AI ENGINE
🤖
MCP Agent
🔍
Fraud Alerts
12
Command Center
Welcome back, Admin · June 2026
⚙️ Settings
🤖 AI Agent
Total Orders
1,42,837
↑ 12% today
GMV Today
₹38.4L
↑ 8.2% vs yesterday
Active Sellers
4,219
→ 23 pending KYC
Fraud Flags
12
↑ 3 new alerts
Recent Orders
ORDER ID	CUSTOMER	AMOUNT	STATUS
#BPZ-10482	Meera S.	₹2,499	Delivered
#BPZ-10481	Ravi K.	₹5,120	In Transit
#BPZ-10480	Anitha P.	₹899	Dispute
Admin Module Reference
Module	Phoenix Page Ref	BUPZO Custom Feature
Products	Add Product / Products List	AI auto-description via MCP Agent on add
Orders	Orders / Order Details / Refund	WebSocket live status + AI dispute scoring
Customers	Customers / Customer Details	Fraud risk score badge + wallet history
Sellers	Custom (extend CRM module)	KYC status, commission rate, payout schedule
Financials	Custom (extend Stock module)	Escrow balance, aggregator success rates, audit log
Dispute Center	Custom (extend CRM Deals)	MCP agent recommendation + manual override

ustomer Storefront — Bloom Template
Clean, modern e-commerce UI inspired by Bloom — adapted for BUPZO multi-vendor marketplace
BUPZO
New Arrivals
Categories
Sellers
Deals
Track Order
🔍 Search
🛒 Cart (3)
👤 Account
✦ AI-POWERED MARKETPLACE
Discover Products
Made for You
Personalized recommendations powered by AI. Real-time tracking. Secure escrow payments.

Shop Now View Sellers
Featured Products
View All →
👟
AirFlex Runner
₹7,499
by SportZone
+ Add to Cart
👗
Urban Kurta Set
₹1,299
by FashionHub
+ Add to Cart
📱
Smart Case X12
₹499
by TechStore
+ Add to Cart
🎧
BassWave Pro
₹3,199
by AudioWorld
+ Add to Cart
Track your order in real-time
WhatsApp updates · Live map tracking · AI ETA
📦 Track Order
Customer Page Reference
Page	Bloom Template Ref	BUPZO Enhancement
Homepage	bloomtpl/ — product grid	AI-personalized product feed via pgvector
Product Detail	bloomtpl/product/1/	AI-generated description, multi-seller compare, reviews via WebSocket
Cart	bloomtpl/cart/	Voucher/Promo engine, saved for later, stock check
Checkout	Custom	Razorpay/Stripe routing, escrow confirmation, address autofill
Order Tracking	Custom	Real-time map, WhatsApp updates, estimated AI delivery time
Invoice	Custom	Downloadable PDF, GST-compliant, multi-item split billing


Complete Technology Stack
Every tool, framework, and service powering BUPZO
FRONTEND
⚛️
Next.js 15
App Router + SSR
🎨
Tailwind CSS
Utility-first styling
🗃️
Redux Toolkit
Global state mgmt
✨
Framer Motion
Animations & micro-UX
📱
PWA
Offline + installable
BACKEND
⚡
FastAPI
Python async API
🔴
Redis
Cache + sessions
✅
Pydantic
Request validation
🔌
WebSockets
Real-time updates
🚪
Kong / Traefik
API Gateway + rate limit
DATABASE
🐘
PostgreSQL
PostGIS + pgvector
⏱️
TimescaleDB
10Cr event logs
🔀
Citus
DB sharding
AI ENGINE
🦙
Ollama (Mistral 7B)
Local LLM inference
🔗
MCP
Model Context Protocol
🔗
LangChain
Agentic workflows
🧮
pgvector
Semantic search
INFRA & COMMS
🐳
Docker
8-container setup
☸️
Kubernetes
k3s / Kind
🌐
Nginx
Load balancer
☁️
Cloudflare Tunnel
DDoS + CDN
💬
Twilio / Gupshup
WhatsApp gateway
🔔
Firebase FCM
Mobile push
🔄
GitHub Actions
CI/CD pipeline
💳
Stripe / Razorpay
Payment aggregators

Security Architecture — Banking-Grade
Multi-layer security for 10-crore scale with zero-trust principles
🔑
JWT Auth Flow
On login: Access Token (15 min TTL) + Refresh Token (30 days, httpOnly cookie). Every API call validates Access Token. Refresh endpoint rotates tokens. Revocation list in Redis for immediate logout.

Access Token
Refresh Token
Redis Revocation
🎭
RBAC — Role-Based Access
Three permission tiers: Admin (full system access), Seller (own inventory + orders), Customer (own orders + profile). Middleware enforces role on every FastAPI route. Permission matrix stored in PostgreSQL.

Admin
Seller
Customer
Middleware
⚡
API Rate Limiting
Kong/Traefik enforces per-IP and per-user request limits. Sliding window algorithm. Burst allowance for legitimate spikes (e.g. sales events). Bot detection via Cloudflare WAF layer.

Kong
Sliding Window
WAF
🔒
Data Encryption
AES-256 for all PII and financial data at rest. TLS 1.3 for all traffic in transit. Payment card data never stored — tokenized via Stripe/Razorpay. Wallet transactions signed and audited.

AES-256
TLS 1.3
Tokenization
🤖
AI Fraud Detection
MCP agent scores every transaction in real-time. Flags: unusual order velocity, mismatched shipping/billing, new account + high-value orders, multiple failed payment attempts. Auto-hold + admin alert.

MCP Agent
Risk Score
Auto-hold
📋
Audit Logs
Every wallet change, admin action, and order state transition logged immutably to TimescaleDB. Includes actor ID, timestamp, IP, action type, before/after values. Queryable for financial audits and compliance.

Immutable Log
TimescaleDB
Compliance
Disaster Recovery & Scale Strategy
Concern	Strategy	Tool	RTO/RPO
DB Failure	Automated snapshots + point-in-time recovery	pg_dump + Cron + S3-compatible	RPO < 1hr
Service Crash	Kubernetes auto-restart + health probes	K8s liveness/readiness	RTO < 30s
Traffic Spike	Horizontal pod autoscaling (HPA)	K8s HPA + Redis queue	Auto-scale in < 2min
DDoS Attack	Cloudflare WAF + rate limiting at edge	Cloudflare Tunnel + Kong	Transparent
Payment Failure	Retry with alternate aggregator (Stripe → Razorpay)	Smart Router Service	Auto in < 5s
Global Expansion	Multi-currency wallet, i18n routing, regional DB replicas	PostGIS + i18n config	Config-driven
BUPZO
Platform Blueprint v1.0 · Built for 10-crore scale · Next.js 15 + FastAPI + PostgreSQL
Admin UI: Phoenix v1.24.0 · Customer UI: Bloom Template
8 Microservices · Kubernetes · MCP AI · JWT Security