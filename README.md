# 💬 TalkFlow 

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
### ScreenShots

### 🔐 Login Page  
Displays the login interface where users authenticate to access the chat application.  
![Login Page](https://github.com/user-attachments/assets/72f39634-78b0-4db9-971b-a04ffee0a3ae)

---

### 🎨 Theme Support  
Showcases the ability to switch between light and dark themes for a personalized experience.  
![Theme Support](https://github.com/user-attachments/assets/dd9a73dd-9801-479c-8066-8339e264adf7)

---

### 👤 Edit Profile  
Users can update their profile details, including name, email, and profile image.  
![Edit Profile](https://github.com/user-attachments/assets/cc69d4ea-51ee-4e2d-9156-e8a1cc581137)

---

### ⚙️ User Friendly UI 
simple to use user friendly ui supporting personal one to one and group chats
![Group Settings](https://github.com/user-attachments/assets/ef715530-e99d-4728-b318-0483ad2875f4)

---

### 💬 Real-Time Chat Dashboard  
Displays all personal and group chats with real-time updates. Includes tabs for navigation and a button to create new groups.  
![Chat Dashboard](https://github.com/user-attachments/assets/b356cd48-71f7-437d-b68f-ae0009b7afba")

---

### 🔔 Toast Notifications  
Real-time notifications for actions like user additions, removals, group renaming, and other key events.  
![Toast Notifications](https://github.com/user-attachments/assets/e2bad561-5a43-4f30-8068-f90b53d1212a)

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
