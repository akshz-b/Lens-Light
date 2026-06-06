# Lens & Light - Photography Portfolio (Dual-Backend Architecture)

A highly scalable, production-ready photography portfolio. The application has been structured to give you the ultimate flexibility: it includes **two separate backend implementations**.

You can run the app using the traditional Full-Stack **Node.js (Express)** backend (which is fully configured for your current environment), or you can use the industry-standard decoupled **Python (FastAPI)** backend for local testing and future microservice scaling.

---

## 📁 Repository Structure
* **/frontend**: The React Vite Frontend (Tailwind CSS, Framer Motion)
* **/nodejs_backend**: The Node.js / Express Backend (Mongoose MongoDB, Cloudinary, Multer)
* **/fastapi_backend**: The Python / FastAPI Backend (Motor Async MongoDB, PyJWT, Pydantic)

---

## 🌎 Global Environment Setup
Both backends use the exact same database and the exact same environment variables.

1. Create a file named exactly `.env` in the root folder.
2. Copy the keys from `.env.example` and fill in your details:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio_dev?retryWrites=true&w=majority"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ADMIN_PASSWORD="devpassword"
   JWT_SECRET="devsecret"
   ```

---

## 🟢 Option A: Running the Node.js Backend (Recommended & Default)
*This is the default configuration. It successfully bounds the React frontend and Node.js API together on the same port so it works seamlessly in containerized environments and direct deployment.*

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   *(Your app runs entirely on `http://localhost:3000`)*

---

## 🐍 Option B: Running the Python FastAPI Backend (Local Dev)
*Use this option if you want to experiment with the Python backend locally on your computer. This decouples the frontend and backend.*

**1. Start the Python API**
Open a terminal and navigate strictly to the backend folder:
```bash
cd fastapi_backend
```
Create a virtual environment, install dependencies, and run Uvicorn:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*(The API runs on `http://localhost:8000` | Auto-generated docs limit at `http://localhost:8000/docs`)*

**2. Start the Frontend Separately**
Open a new terminal window in the repository root (bypassing the Node backend):
```bash
npx vite --port 5173
```
*(You will need to ensure your frontend fetches from `http://localhost:8000/api` locally either by updating a base URL in React or configuring proxy settings in `vite.config.ts`)*

---

## 🚀 Deployment Guide

### Deploying the Node.js Version (Easiest)
Since the Node.js server seamlessly builds and serves your React frontend, deploying is a 1-step process.

1. Create an account on **Render.com**.
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the commands:
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
4. Add your Environment Variables (`MONGODB_URI`, etc.) in the Render dashboard.
5. Click **Deploy**.

### Deploying the FastAPI Version (Microservice Architecture)
Deploying the decoupled architecture means deploying the frontend and backend to two different places.

**1. Deploy Backend (Render / Heroku / Railway)**
* Connect the repository to your host.
* Set the Root Directory to `fastapi_backend` (if supported) or deploy just that folder.
* Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
* Add your Environment Variables.

**2. Deploy Frontend (Vercel / Netlify)**
* Import the repository to Vercel.
* Set the build command to `npm run build`.
* Add an environment variable tracking your deployed FastAPI URL (e.g., `VITE_API_URL=https://your-fastapi-app.onrender.com`).
* Build and deploy!
