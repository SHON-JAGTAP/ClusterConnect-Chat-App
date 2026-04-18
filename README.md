# ClusterConnect Chat App

> A cloud-native real-time chat application built with modern DevOps and distributed system principles.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?style=flat&logo=kubernetes&logoColor=white)

---

## 🚀 Tech Stack

### Frontend
| Technology | Details |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **TailwindCSS 3** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Socket.IO Client 4** | Real-time communication |
| **Axios** | HTTP client |
| **@react-oauth/google** | Google OAuth integration |
| **Vercel** | Frontend hosting & deployment |

### Backend
| Technology | Details |
|---|---|
| **Node.js + Express** | REST API server |
| **Socket.IO 4** | WebSocket real-time messaging |
| **Mongoose** | MongoDB ODM |
| **KafkaJS** | Message streaming (Apache Kafka) |
| **ioredis** | Redis client |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **google-auth-library** | Google OAuth verification |
| **Render** | Backend hosting & deployment |

### Infrastructure & Services
| Technology | Details |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Upstash Redis** | Serverless Redis caching |
| **Apache Kafka** | Distributed message streaming |
| **Docker** | Containerization |
| **Kubernetes** | Container orchestration |
| **GitHub Actions** | CI/CD pipeline |

---

## ✨ Features

- 🔴 **Real-time messaging** via Socket.IO WebSockets
- 🔐 **Secure authentication** — JWT + Google OAuth 2.0
- ⚡ **Kafka-based message streaming** with fallback delivery
- 🧠 **Redis caching** via Upstash for session & performance
- 🌿 **MongoDB Atlas** for scalable cloud data persistence
- 🐳 **Docker** containerized services
- ☸️ **Kubernetes** deployment manifests included
- 🚀 **Deployed** — backend on Render, frontend on Vercel

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Webapp url** |(https://cluster-connect-chat-app-dw3e.vercel.app)

---

## 🏃 Run Locally

### 1️⃣ Clone Repository
```bash
git clone https://github.com/SHON-JAGTAP/ClusterConnect-Chat-App.git
cd ClusterConnect-Chat-App
```

### 2️⃣ Backend Setup
```bash
cd clusterconnect-backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**Required `.env` variables:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URL=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAFKA_BROKERS=localhost:9092
REDIS_URL=your_upstash_redis_url
```

### 3️⃣ Frontend Setup
```bash
cd Frontend/clusterconnect-client
npm install
npm run dev
```

### 4️⃣ (Optional) Run with Docker
```bash
cd clusterconnect-backend
docker-compose up --build
```

---

## 📁 Project Structure

```
ClusterConnect/
├── Frontend/
│   └── clusterconnect-client/    # React + Vite frontend
│       ├── src/
│       ├── vercel.json
│       └── Dockerfile
├── clusterconnect-backend/        # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── k8s/                      # Kubernetes manifests
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── server.js
└── .github/
    └── workflows/                # GitHub Actions CI/CD
```

---

## ☸️ Kubernetes Deployment

Kubernetes manifests are located in `clusterconnect-backend/k8s/`.

```bash
kubectl apply -f clusterconnect-backend/k8s/
```

---

## 📄 License

ISC © [Shon Jagtap](https://github.com/SHON-JAGTAP)
