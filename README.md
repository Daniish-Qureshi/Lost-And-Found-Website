# 🔍 Lost & Found Web Portal

A full-stack community platform to report lost and found items, connect with people, and reunite belongings with their owners.

🌐 **Live Demo**: [lost-and-found-website-six.vercel.app](https://lost-and-found-website-six.vercel.app)  
👨‍💻 **Developer**: [Danish Qureshi](https://danish-qureshi-6ew5.vercel.app)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login & password change
- 📦 **Item Management** — Post lost/found items with image uploads
- 💬 **Real-time Chat** — Socket.io powered messaging between users
- 🔔 **Notifications** — Bell notifications for claims & messages
- 🤖 **Item Match System** — Auto-matches lost & found items
- 🙋 **Claim System** — Claim items with proof description
- 👤 **User Profiles** — Avatar upload, edit profile info
- 🛡️ **Admin Dashboard** — Manage users, items & claims
- 📤 **Share Button** — Share items on WhatsApp, Facebook
- 🖼️ **Cloudinary Images** — Persistent cloud image storage
- 📱 **Mobile Responsive** — Fully optimized for all screen sizes

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
- PostgreSQL (Neon.tech) + Prisma ORM

### Deployment
- Frontend: Vercel
- Backend: Render
- Images: Cloudinary
- Database: Neon.tech (PostgreSQL)

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Neon.tech free tier)
- Cloudinary account

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

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run Prisma migrations and start server:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend setup

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
Lost-And-Found-Website/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
├── server/          # Node.js + Express backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   ├── middleware/
│   └── index.js
```

---

## 🔧 Environment Variables (Render Deployment)

When deploying backend to Render, set these environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon.tech) |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL (Vercel) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## 👨‍💻 Developer

**Danish Qureshi** — Full Stack Developer (MERN + PostgreSQL)

- 🌐 Portfolio: [danish-qureshi-6ew5.vercel.app](https://danish-qureshi-6ew5.vercel.app)
- 💻 GitHub: [@Daniish-Qureshi](https://github.com/Daniish-Qureshi)
- 📧 Email: danishwork29@gmail.com
