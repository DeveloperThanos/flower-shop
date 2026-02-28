# 🌸 FlowerBill - Flower Shop Billing System

A fully responsive billing system for flower sellers built with **Next.js 14**, **Tailwind CSS**, and **Neon PostgreSQL**.

## Features
- 🔐 Register & Login via Phone Number + Password
- 📊 Dashboard with bill stats, flower analytics
- 🧾 Billing page with dynamic flower item entries
- 💾 Save bills to Neon PostgreSQL
- 📥 Export invoices as PDF (black & white)
- ✅ Payment status toggle on all bills
- 📋 Bills history with search & PDF download
- 📱 Fully responsive (mobile-first)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string

### 3. Configure environment
Copy `.env.local.example` to `.env.local` and fill in:
```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=any-random-secret-string
```

### 4. Initialize database
The tables are created automatically when you first use the app via the API routes.

Or run this SQL manually in Neon Console:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage
1. Register with your name, phone, address, password
2. Login using phone + password
3. Go to **New Bill** to create an invoice
4. Add flowers with price/kg and quantity
5. Toggle payment status
6. Save & download as PDF
7. View all bills in **Bills** page

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (custom black + violet theme)
- **Neon PostgreSQL** (serverless DB)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (auth)
- **jsPDF + autoTable** (PDF generation)
