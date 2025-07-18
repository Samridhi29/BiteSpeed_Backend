# 🧩 Identity Reconciliation Service

A backend service to reconcile contact identities (like email, phone number, etc.) into a unified primary contact with linked secondary contacts.

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Samridhi29/identity-reconciliation-service.git
cd identity-reconciliation-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=your_postgresql_url_from_render
PORT=3000
```

### 4. Prisma Setup (Generate client & apply schema)

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Start the Server

#### For development:

```bash
npm run dev
```

#### For production:

```bash
npm run build
npm start
```

---

## 📮 API Endpoint

### `POST /identify`

Submit a new identity for reconciliation.

#### 📥 Request Body:

```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "linkedId": null
}
```

#### 📤 Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["john@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

---

## 🛠 Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
