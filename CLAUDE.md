# ClusterConnect Chat App - Agent Context

This is the central context file for Claude Code Agents working on the ClusterConnect application.
Whenever an agent team or subagent is spawned, please refer to this context.

## Application Architecture
- **Frontend**: React + Vite (located in `Frontend/clusterconnect-client`)
- **Backend**: Node.js + Express (located in `clusterconnect-backend`)
- **Database**: MongoDB (via Mongoose)
- **Features**: Real-time messaging using Socket.IO, JWT + Google OAuth authentication, Redis caching, and Kafka-based message streaming.

## Goals for Agent Teams
When exploring or refactoring the codebase as a team:
1. **Frontend Specialists**: Focus on React best practices, responsive design, performance optimization in Vite, and component reuse.
2. **Backend Specialists**: Focus on Express route efficiency, Socket.IO event reliability, Mongoose query optimization, and Kafka/Redis integration correctly.
3. **Security Specialists**: Review token handling (JWT), WebSocket security, input validation, and general secure coding practices.

## Guidelines
- Always document any architectural changes in the corresponding Markdown files.
- Preserve consistent error handling formats across the backend and frontend.
- When working in parallel, avoid conflicting changes to the same files. Delegate front-end tasks, back-end tasks, and configuration tasks to separate teammates.
