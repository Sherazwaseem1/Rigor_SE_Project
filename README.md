# Rigor_SE_Project


# Fleet Management and Reimbursement System

A mobile-first system designed to efficiently manage fleet logistics and trucker reimbursements. It provides two interfaces: one for **Admins** to manage trips and reimbursements, and another for **Truckers** to view assigned trips, upload receipts, and track their journeys.

---

## 🚀 Features

- 📍 Live truck location tracking on a map
- 🚛 Trip creation and assignment (one truck per trucker)
- 🧾 Reimbursement claim submission with image uploads
- 📂 Admin dashboard with real-time trip and reimbursement overview
- 🔒 User authentication and role-based access (Admin/Trucker)

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native (Expo)**
- **TypeScript**
- **Tailwind CSS (via NativeWind)**
- **Axios** for API calls

### Backend
- **Node.js** with **Express**
- **MongoDB** (Mongoose)
- **Cloudinary** for image storage
- **Socket.IO** for real-time features
- **Firebase/Firestore** (optional for profile images)

---

## 📦 Installation & Setup

### 📱 Frontend Setup

1. Navigate to the project root:
   ```bash
   cd <project-root>

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo development server:

   ```bash
   npx expo start
   ```

> Make sure you have **Expo CLI** installed globally (`npm install -g expo-cli`) and the **Expo Go** app on your phone or emulator.

---

### 🖥️ Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

> Ensure MongoDB is running locally or update the `.env` with your remote connection string.

---

## 🔐 Environment Variables

Create a `.env` file in the `/backend` folder with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 API Endpoints

The backend provides a full REST API for:

* `/api/admins`
* `/api/truckers`
* `/api/trips`
* `/api/locations`
* `/api/reimbursements`
* `/api/trucks`

Refer to `api.ts` in the frontend for client-side API integration.

---

## 📷 Image Uploads

* Trucker receipts and profile images are uploaded to **Cloudinary**
* Frontend uses `expo-image-picker` to select images

---


## 👨‍💻 Authors

**Sheraz Waseem** – Computer Science Senior @ LUMS  
**Umair Amir** – Computer Science Senior @ LUMS  
**Haseeb Ashfaq Janjua** – Computer Science Senior @ LUMS  
**Hania Farhan** – Computer Science Senior @ LUMS

