# 🏦 Ledger Banking API

A production-grade banking transaction system backend built with **Node.js**, **Express**, and **MongoDB** — designed to mirror real-world banking architectures with a focus on **data consistency**, **auditability**, and **secure financial operations**.

> 🎯 Built using a **Ledger-based architecture** — balances are never hardcoded, they are always derived from actual transaction history, guaranteeing full data integrity.

**🌐 Live API:** `https://backend-ledger-f0dy.onrender.com`


<p align="center">
  <img src="./images/Screenshot%202026-06-03%20212127.png" width="600" alt="Project Overview"/>
 <img width="600" height="500" alt="diagram (3)" src="https://github.com/user-attachments/assets/b797b86d-c8b7-4a67-8b0e-9120e582a11e" />
</p>




---

## 📌 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [Account Routes](#account-routes)
  - [Transaction Routes](#transaction-routes)
- [How the Ledger System Works](#how-the-ledger-system-works)
- [Idempotency Keys](#idempotency-keys)
- [License](#license)

---

<a id="architecture-overview"></a>
## 🏗 Architecture Overview

```
Client Request
      │
      ▼
  Express Router
      │
      ▼
Auth Middleware (JWT Verify)
      │
      ▼
  Controller
      │
      ▼
  Service Layer
      │
      ▼
  MongoDB (Atlas)
  ┌──────────────────────────────────────┐
  │  Users │ Accounts │ Transactions     │
  │                   │ Ledger Entries   │
  └──────────────────────────────────────┘
      │
      ▼
  Nodemailer (Gmail OAuth)
  [Email Alerts on Account Events]
```

The project follows a **modular MVC-style architecture** with clear separation between routes, controllers, services, and models.

---

<a id="features"></a>
## ✨ Features

- 🔐 **JWT Authentication** with bcrypt password hashing
- 📧 **Email Notifications** via Nodemailer + Google Gmail OAuth
- 🏦 **Multi-Account Support** per user
- 📒 **Ledger-Based Balance Calculation** — no hardcoded balances, ever
- 🔁 **Idempotency Keys** — prevents duplicate transactions on retry
- 📊 **MongoDB Aggregation Pipeline** — dynamic balance computation
- 🛡️ **Auth Middleware** on all protected routes
- 🔑 **System-level access control** for fund injection
- ☁️ **Deployed on Render** with secured environment variables

---

<a id="tech-stack"></a>
## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcrypt |
| Email Service | Nodemailer + Google Gmail API (OAuth2) |
| Deployment | Render |

---

<a id="project-structure"></a>
## 📁 Project Structure

```
ledger-api/
├── controllers/
│   ├── authController.js
│   ├── accountController.js
│   └── transactionController.js
├── models/
│   ├── User.js
│   ├── Account.js
│   ├── Transaction.js
│   └── Ledger.js
├── routes/
│   ├── authRoutes.js
│   ├── accountRoutes.js
│   └── transactionRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── authSystemUserMiddleware.js
├── services/
│   └── emailService.js
├── .env
├── app.js
└── server.js
```

---

<a id="getting-started"></a>
## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Google Cloud project with Gmail API enabled (for email notifications)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ledger-api.git
cd ledger-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in your values in .env

# Start development server
npm run dev
```

---

<a id="environment-variables"></a>
## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ledger

# JWT
JWT_SECRET=your_super_secret_jwt_key

# System User (for initial funds injection)
SYSTEM_SECRET=your_system_level_secret

# Google Gmail OAuth2 (Nodemailer)
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_USER=your_email@gmail.com
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

<a id="api-reference"></a>
## 📡 API Reference

> **Protected routes** require the `Authorization: Bearer <token>` header.

---

<a id="auth-routes"></a>
### 🔐 Auth Routes

**Base:** `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive JWT |
| POST | `/logout` | ❌ | Logout user |

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt_token>"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "<jwt_token>"
}
```

**Register — `201 Created`**
![Register](./images/Screenshot%202026-06-03%20212416.png)

**Login — `200 OK`**
![Login](./images/Screenshot%202026-06-03%20212433.png)

**📧 Email Notification on Registration**
![Email Notification](./images/Screenshot%202026-06-03%20212512.png)

---

<a id="account-routes"></a>
### 🏦 Account Routes

**Base:** `/api/v1/account`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ User | Create a new bank account |
| GET | `/` | ✅ User | Get all accounts of logged-in user |
| GET | `/balance/:accountId` | ✅ User | Get real-time balance via ledger aggregation |

> 💡 Balance is computed dynamically using **MongoDB Aggregation Pipeline** by summing all credit and debit ledger entries — not fetched from a static field.

#### Create Account
```http
POST /api/v1/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountName": "Savings Account"
}
```

#### Get Balance
```http
GET /api/v1/account/balance/:accountId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "accountId": "abc123",
  "balance": 15000
}
```

**Create Account — `201 Created`**
![Create Account](./images/Screenshot%202026-06-03%20213420.png)

**Get Balance — `200 OK`**
![Get Balance](./images/Screenshot%202026-06-03%20214446.png)

---

<a id="transaction-routes"></a>
### 💸 Transaction Routes

**Base:** `/api/v1/transaction`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/transfer` | ✅ User | Transfer funds between accounts |
| POST | `/initial-funds` | ✅ System | Inject initial funds into an account |

#### Transfer Funds
```http
POST /api/v1/transaction/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": "abc123",
  "toAccountId": "xyz789",
  "amount": 500,
  "idempotencyKey": "unique-key-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer successful",
  "transactionId": "txn_98765"
}
```

#### Initial Funds Injection *(System Only)*
```http
POST /api/v1/transaction/initial-funds
Authorization: Bearer <system_token>
Content-Type: application/json

{
  "accountId": "abc123",
  "amount": 10000
}
```

**Initial Funds — `201 Created`**
![Initial Funds](./images/Screenshot%202026-06-03%20213908.png)

**Transfer Funds — `201 Created`**
![Transfer](./images/Screenshot%202026-06-03%20215215.png)

**📧 Email Alert on Transfer**
![Transaction Email](./images/Screenshot%202026-06-03%20215932.png)

---

<a id="how-the-ledger-system-works"></a>
## 📒 How the Ledger System Works

Instead of storing a `balance` field directly on an account, every financial event is stored as a **Ledger Entry**:

```
Account Created
      │
      ▼
Initial Funds Added → Ledger Entry { type: "credit", amount: 10000 }
      │
      ▼
Transfer of ₹500  → Ledger Entry { type: "debit",  amount: 500,  fromAccount: A }
                  → Ledger Entry { type: "credit", amount: 500,  toAccount:   B }
      │
      ▼
Balance Query
  = SUM(all credits) - SUM(all debits)
  = Calculated via MongoDB Aggregation Pipeline
```

**Why this matters:**
- ✅ Full audit trail of every rupee
- ✅ Balance is always derivable from history
- ✅ No risk of balance going out of sync
- ✅ Mirrors how real banks operate

---

<a id="idempotency-keys"></a>
## 🔁 Idempotency Keys

To prevent duplicate transactions (e.g., if a client retries a failed request), every transfer request accepts an `idempotencyKey`.

```
Client sends Transfer Request with idempotencyKey: "order-pay-001"
      │
      ▼
Server checks: Has this key been processed before?
      │
      ├── YES → Return original response (no duplicate transaction)
      │
      └── NO  → Process transaction, store key, return response
```

This is a **critical requirement** in real-world payment systems to ensure that network retries don't result in double charges.

---

## ☁️ Deployment

This API is deployed on **Render**.

Key deployment practices followed:
- All secrets stored as **environment variables** on Render dashboard
- `node_modules/` and `.env` excluded via `.gitignore`
- MongoDB Atlas connection string whitelisted for Render's IP range

---

<a id="license"></a>
## 📄 License

MIT © [Priyanshu Varshney](https://github.com/harshhere905)

---

<p align="center">Built with ❤️ following production-grade banking architecture principles</p>
