# API My Boilerplate

RESTful API built with **NestJS** and **Prisma**.

---

## 🚀 Tech Stack

| Tool / Library     | Description                                 |
|--------------------|---------------------------------------------|
| **NestJS**         | Node.js framework for scalable applications |
| **Prisma**         | ORM to manage the database                  |
| **Jest**           | Testing framework                           |
| **Supertest**      | HTTP assertions for integration tests       |
| **TypeScript**     | Static typing                               |

---

## 📦 Installation

Clone the repository, create env file and install the dependencies:

```bash
git clone https://github.com/leonardohssena/my-boilerplate.git
cd my-boilerplate
cp .env.example .env
nvm use
npm install
make prisma-update
```

## ▶️ Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## 📡 API Endpoint

### 🔍 Swagger Documentation

You can access the Swagger UI at:
`http://localhost:3000/api`

This provides interactive documentation for all available endpoints, request/response schemas, and examples.
> Swagger is automatically available when the app is running.

## 🧪 Running Integration Tests

```bash
npm run test
```
