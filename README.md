# 💬 TalkFlow – Real-Time Chat Application

![TalkFlow Banner](https://img.shields.io/badge/MERN-Stack-blue.svg) ![Live Chat](https://img.shields.io/badge/Real--Time-Enabled-brightgreen)

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

## 📸 Screenshots

Below are some key screens from the application that showcase core features and UI interactions.

---

### 🔍 Search Feature (Real-time User Search)
![Search Feature](https://github.com/user-attachments/assets/72f39634-78b0-4db9-971b-a04ffee0a3ae)

---

### 💬 Chat Interface (Private & Group Chat)
![Chat Interface](https://github.com/user-attachments/assets/dd9a73dd-9801-479c-8066-8339e264adf7)

---

### 👥 Group Chat Creation and Management
![Group Chat](https://github.com/user-attachments/assets/cc69d4ea-51ee-4e2d-9156-e8a1cc581137)

---

### ⚙️ Group Settings Modal (Admin Controls)
- Rename Group  
- Add/Remove Members  
- Update Group Logo  
- Leave/Delete Group  
![Group Settings](https://github.com/user-attachments/assets/8d3c9fe3-61d0-4bf7-8404-b4f454180e68)

---

### 🖥️ Dashboard View
- Displays all users and group chats  
- Tabs for easy switching  
- Group creation button  
![Dashboard](https://github.com/user-attachments/assets/ff182346-cc49-4a88-a0ef-292e344cae7a)

---

### ✅ Toast Notifications
- Real-time updates  
- Feedback for group events (added/removed, rename, etc.)  
![Toast Notification](https://github.com/user-attachments/assets/e2bad561-5a43-4f30-8068-f90b53d1212a)

---

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
```bash
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

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
