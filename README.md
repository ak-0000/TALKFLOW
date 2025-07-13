# 💬 TalkFlow – Real-Time Chat Application

![TalkFlow Banner](https://img.shields.io/badge/MERN-Stack-blue.svg) ![Live Chat](https://img.shields.io/badge/Real--Time-Enabled-brightgreen) ![Status](https://img.shields.io/badge/Status-Under%20Development-orange)

**TalkFlow** is a modern full-stack real-time chat application built with the MERN stack. It supports 1-on-1 chats, group chats, chat notifications, typing indicators. Designed with a clean UI and developer-friendly architecture.

---

## 🛠️ Tech Stack

**Frontend**  
- React.js + TailwindCSS + DaisyUI  
- Zustand for state management  
- Axios for API calls  
- React Router  
- Socket.IO Client

**Backend**  
- Node.js + Express.js  
- MongoDB + Mongoose  
- Socket.IO Server  
- Cloudinary for image uploads  
- JWT for authentication  
- Bcrypt.js for secure password hashing

---

***💖 Support***
*If you find this project useful, consider giving it a ⭐ on GitHub!*

## 🔑 Key Features

- 🔐 **Secure Authentication** with JWT
- 💬 **1-on-1 and Group Chats**
- 👥 **Group Settings**
  - Rename group
  - Add/Remove members (admin-only)
  - Leave/Delete group
- ⚡ **Real-Time Messaging** via Socket.IO
- ✍️ **Typing Indicators**
- 🔔 **Real-Time Notifications** (group and personal)
- 🖼️ **Profile & Group Image Uploads** via Cloudinary
- 🌓 **Dark & Light Mode** toggle
- 📱 Fully **responsive UI**
---

## 📦 Getting Started

### 🔧 Prerequisites

- Node.js (v18+)
- MongoDB Atlas or local instance
- Cloudinary Account

---

### 🚀 Local Setup

#### 2. Install Dependencies

**Backend**
```bash
cd backend
npm install

```
**Frontend**

```bash
cd ../frontend
npm install
```
***🔐 3. Setup Environment Variables***
Create .env files in both backend/ and frontend/.

Example for backend/.env:

**env**
PORT=5000.
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

***▶️ 4. Start the Application***
Open two separate terminals and run the following:

Start Backend

```bash

cd backend
npm start
```
Start Frontend

```bash

cd frontend
npm start
```
