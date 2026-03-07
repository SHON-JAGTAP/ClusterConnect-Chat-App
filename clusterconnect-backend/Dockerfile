FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Run migrations on startup, then start the server
CMD ["sh", "-c", "npm run migrate && node server.js"]
