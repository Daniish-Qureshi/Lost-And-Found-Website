# 🔍 Lost & Found Web Portal

A full-stack community platform to report lost and found items, connect with people, and reunite belongings with their owners.

🌐 **Live Demo**: [Lost & Found](https://lost-and-found-website-six.vercel.app)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & register
- 📦 **Item Management** — Post lost/found items with images
- 💬 **Real-time Chat** — Socket.io powered messaging
- 🔔 **Notifications** — Bell notifications for claims & messages
- 🤖 **Item Match System** — Auto-matches lost & found items
- 🙋 **Claim System** — Claim items with proof
- 👤 **User Profiles** — Avatar upload, edit profile
- ⚡ **Admin Dashboard** — Manage users, items & claims
- 📤 **Share Button** — Share items on WhatsApp, Facebook
- 🖼️ **Cloudinary Images** — Persistent image storage

---

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- Socket.io Client
- Axios

### Backend
- Node.js + Express.js
- Socket.io
- JWT Authentication
- Multer + Cloudinary

### Database
- MongoDB Atlas + Mongoose

### Deployment
- Frontend: Vercel
- Backend: Render
- Images: Cloudinary
- Database: MongoDB Atlas

---

## 🚀 Run Locally

### Clone the repo
```bash
git clone https://github.com/Daniish-Qureshi/Lost-And-Found-Website.git
cd Lost-And-Found-Website
```

### Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
```bash
npm run dev
```

### Frontend setup
```bash
cd client
npm install
npm run dev
```

---

## 📸 Screenshots

> Coming soon

---

## 👨‍💻 Developer

**Danish Qureshi**
- GitHub: [@Daniish-Qureshi](https://github.com/Daniish-Qureshi)
- Portfolio: [danish-qureshi-6ew5.vercel.app](https://danish-qureshi-6ew5.vercel.app)
