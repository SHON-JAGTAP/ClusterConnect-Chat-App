# MongoDB Migration Guide

## ✅ What Changed

Your ClusterConnect backend has been successfully migrated from **MySQL to MongoDB Atlas**!

### Files Updated:
- ✅ `package.json` - Removed `mysql2` and `pg` dependencies
- ✅ `config/db.js` - Now connects to MongoDB using Mongoose
- ✅ `models/userModel.js` - Converted to Mongoose schema
- ✅ `models/messageModel.js` - Converted to Mongoose schema
- ✅ `server.js` - Updated to initialize MongoDB connection

### What You Get:
- 🆓 **Free tier forever** (512MB storage)
- ☁️ **Fully managed cloud database**
- 📊 **Built-in monitoring & backup**
- 🚀 **No maintenance needed**

---

## 🚀 Setup Steps

### Step 1: Create MongoDB Atlas Account
```
1. Go to: https://mongodb.com/cloud/atlas
2. Sign up for free
3. Create a free tier cluster (M0)
4. Choose region: us-east-1 (or nearest to your app)
```

### Step 2: Get Connection String
```
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace <username> and <password> with your credentials
```

Example:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/clusterconnect?retryWrites=true&w=majority
```

### Step 3: Add to .env File
Create `.env` in `clusterconnect-backend/`:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/clusterconnect?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### Step 4: Install Dependencies
```bash
cd clusterconnect-backend
npm install
```

### Step 5: Run Your App
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📝 Data Structure Changes

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  password: "hashed_password",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  sender_id: ObjectId (references Users),
  message: "Hello",
  chatRoom: "room_name",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 🔑 MongoDB Atlas IP Whitelist

**Important:** Allow your app to connect:
1. Go to MongoDB Atlas Console
2. Network Access → IP Whitelist
3. Add your IP or allow `0.0.0.0/0` (for Any IP)
4. For AWS deployment: Whitelist your AWS security group

---

## 🧪 Test Connection

```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URL).then(() => console.log('✅ MongoDB Connected')).catch(err => console.error('❌ Error:', err))"
```

---

## 📊 MongoDB Features to Know

- **No schema validation** - Flexible like NoSQL
- **Automatic backups** - Every 3.5 hours (free tier)
- **MongoDB Compass** - Visual database explorer
- **Atlas Charts** - Real-time analytics

---

## 🐛 Troubleshooting

**Connection refused?**
- Check IP whitelist in MongoDB Atlas
- Verify connection string is correct
- Ensure `.env` file exists and has `MONGODB_URL`

**"E11000 duplicate key error"?**
- Email already exists in database
- Drop collection and try again

**Slow queries?**
- Add indexes to frequently searched fields
- Use MongoDB Atlas performance profiler

---

## 🎯 Next: Deploy to AWS

Once tested locally, you can deploy to:
- **App Runner** (easiest, free tier)
- **EC2** (most control)
- **ECS/Fargate** (managed containers)

Update your deployment config with the `MONGODB_URL` environment variable.

---

Happy coding! 🚀
