# Lens & Light - Photography Portfolio

A full-stack, production-ready photography portfolio built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, and Cloudinary.

## 🚀 Quick Start: Local Development

Follow these steps to download the repository and run the project on your local computer.

### 1. Clone or Download the Repository
If you downloaded the ZIP file, extract it. If you are using Git, run:
```bash
git clone https://github.com/your-username/Lens-Light.git
cd Lens-Light
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed. Then run:
```bash
npm install
```

### 3. Set Up Environment Variables (The `.env` file)
You need to connect your local app to a database and storage provider. 
1. Create a file named **exactly** `.env` in the root folder of the project.
2. Copy the contents of `.env.example` into your new `.env` file.
3. Fill in the values with your **Development** credentials (see below).

```env
# .env
# Use a DEV database so you don't accidentally delete production data!
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio_dev?retryWrites=true&w=majority"

# Cloudinary Credentials (You can use the same account for dev and prod)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

ADMIN_PASSWORD="devpassword"
JWT_SECRET="devsecret"
```

### 4. Run the Development Server
```bash
npm run dev
```
Your app will now be running at `http://localhost:3000`. Any changes you make to the code will automatically update in the browser!

---

## 🔄 Toggling Between Development and Production

The app is built to automatically know whether it is running locally or on your live server (like Render). You **do not** need to change the code to toggle between them.

Here is how it works:

### Local Environment (Development)
When you run `npm run dev` on your computer:
* The app reads your local `.env` file.
* It connects to your `portfolio_dev` database.
* When you upload a photo, it goes into a folder called `portfolio_dev` in Cloudinary.

### Live Environment (Production)
When your app is deployed to Render and runs `npm start`:
* Render automatically sets a hidden variable called `NODE_ENV=production`.
* The app ignores your local `.env` file and uses the Environment Variables you typed into the Render dashboard.
* It connects to your live `portfolio` database.
* When you upload a photo, it goes into a folder called `portfolio_prod` in Cloudinary.

**Summary:** To toggle between them, just run `npm run dev` locally, and let Render run `npm start` in production. They are completely isolated!

---

## 🛠 How to Add a New Feature

If you want to add a new feature (e.g., a "Blog" section or an "About Me" page), follow this clean workflow:

### Step 1: Create the Frontend (React)
1. Go to `src/pages/` and create your new page (e.g., `About.tsx`).
2. Go to `src/App.tsx` and add a new Route for your page:
   ```tsx
   import About from './pages/About';
   // ... inside router ...
   { path: "/about", element: <About /> }
   ```

### Step 2: Create the Database Schema (Mongoose)
If your feature needs to save data (like blog posts):
1. Go to `server/models/` and create a new file (e.g., `Post.ts`).
2. Define your Mongoose schema (look at `Photo.ts` for an example).

### Step 3: Create the Backend API (Express)
1. Go to `server/routes/` and create a new file (e.g., `postRoutes.ts`).
2. Write your `GET`, `POST`, `PUT`, and `DELETE` endpoints.
3. Open `server.ts` and connect your new routes:
   ```ts
   import postRoutes from './server/routes/postRoutes.ts';
   app.use('/api/posts', postRoutes);
   ```

### Step 4: Test Locally
1. Run `npm run dev`.
2. Test your new feature in the browser. Because you are using your `.env` dev database, you can add/delete fake data without worrying about your live site.

### Step 5: Deploy
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Added About page and Blog feature"
   git push
   ```
2. Render will automatically detect the push, build the app, and deploy your new feature to production!
