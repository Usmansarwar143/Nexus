# Business Nexus Platform

A comprehensive, production-ready platform connecting entrepreneurs with investors. The application handles networking, deal flow, live communication, secure real-time collaboration, document processing, and integrated mock-payments — built natively with a modern React (frontend) and Node.js + Express + MongoDB (backend) stack.

---

## Technical Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| **Frontend**   | React 18, TypeScript, Vite, Tailwind CSS          |
| **Backend**    | Node.js, Express.js                               |
| **Database**   | MongoDB (Mongoose ODM)                            |
| **Auth & Security** | JWT, bcrypt, express-validator, mongo-sanitize |
| **Real-time**  | Socket.io (WebRTC Video Calling, Chat)             |
| **File Storage** | Multer (Local static parsing)                     |

---

## Platform Features & Milestones Achieved

The platform has been fully developed across 8 major milestones:

✅ **1. Profiles & Core Navigation:** Fully integrated React SPA mapping Entrepreneur and Investor profiles dynamically from standard REST endpoints.
✅ **2. Real-time Chat Engine:** Built persistent messaging scopes using MongoDB bindings synchronized completely utilizing dynamic Socket.io emit events.
✅ **3. Meeting Calendar Engine:** Fully implemented meeting conflict detection and scheduling logic routing seamlessly within user dashboards.
✅ **4. Video Networking (WebRTC):** Complete browser-to-browser P2P live video streaming utilizing Socket.io as the signaling coordinator mapping directly into dashboard scheduling.
✅ **5. Document Processing Chamber:** Handled safe binary uploads of PDF models via Multer, visual Document Previews on React, and E-signature drawings bound securely within MongoDB arrays. 
✅ **6. Payment Gateway Mock:** Integrated internal simulated atomic transfers, wallet capabilities, and scheduled delays mimicking PayPal/Stripe latencies securely.
✅ **7. Security Hardening:** Processed advanced global NoSQL protection, applied deep XSS string escaping mechanisms, baked `roleAuth` strict JWT validations, and installed a 2FA OTP simulation dynamically triggering on interactive dashboard toggle events. 
✅ **8. Production Integration:** Embedded Vercel configurations (`vercel.json`), responsive dynamic CORS scaling environments, and integrated an internal `/api-docs` testing Swagger-UI mapped portal cleanly linking schemas together securely.

---

## Getting Started Locally

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://localhost:27017` (or wait for the internal `mongodb-memory-server` to automatically provision for local testing environments if unconfigured).

### 1. Installation
Install all dependencies for both scopes via terminal:
```bash
# Frontend
cd Nexus
npm install

# Backend
cd server
npm install
```

### 2. Database Seeding
To spawn dummy profiles, previous transactions, messages, and document links:
```bash
cd server
node seed.js
```

### 3. Start Backend Server
```bash
cd server
npm start
```
*Server binds natively on **http://localhost:5000**. The Swagger API Interface renders on **http://localhost:5000/api-docs**.*

### 4. Start Frontend Client
```bash
# From project root
npm run dev
```
*Frontend spins up utilizing Vite proxy mechanisms over **http://localhost:5173** automatically binding `api/` payloads cleanly to Node paths.*

---

## Built-In Demo Accounts

Use these accounts to instantly test role-based constraints, WebSocket chats, and collaborative interfaces.

**Global Password:** `password123`

| Role          | Email                        |
|---------------|------------------------------|
| **Entrepreneur**  | sarah@techwave.io            |
| **Entrepreneur**  | david@greenlife.co           |
| **Investor**      | michael@vcinnovate.com       |
| **Investor**      | jennifer@impactvc.org        |

---

## Deployment Ready 🚀

This repository is strictly configured for scalable zero-downtime deployments:
1. **Frontend**: Maps automatically integrating straight to Vercel deploying safely bypassing react-router 404 scopes natively mapping `vercel.json`.
2. **Backend**: Prepared cleanly mapping natively through Render or Heroku instances configuring internal scaling schemas and processing external database connections securely out-of-the-box targeting `process.env.MONGO_URI`. 

*(Developed as an enterprise-grade conceptual milestone demonstration)*
