# Fix "DNS resolution" / database connection error

If you see:

```text
Error in connector: ... no record found for Query { name: Name("_mongodb._tcp.cluster.mongodb.net.") ...
```

your **`.env`** file has an invalid or placeholder **DATABASE_URL**.

## Fix

1. Open the **`ctms`** folder and edit **`.env`** (create it from `.env.example` if needed).

2. Set **DATABASE_URL** to a **real** MongoDB connection string.

   **Option A – MongoDB Atlas (cloud)**  
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster → **Connect** → **Drivers** → copy the connection string.  
   - It should look like:  
     `mongodb+srv://USERNAME:PASSWORD@cluster0.XXXXX.mongodb.net/ctms?retryWrites=true&w=majority`  
   - Replace `USERNAME` and `PASSWORD` with your database user and password.  
   - The part after `@` must be **your** cluster host (e.g. `cluster0.b4a9koq.mongodb.net`).  
   - **Wrong:** `cluster.mongodb.net` (placeholder, will fail).  
   - **Right:** `cluster0.something.mongodb.net` (your actual cluster).

   **Option B – MongoDB on your PC**  
   If MongoDB is installed and running locally:
   ```env
   DATABASE_URL="mongodb://localhost:27017/ctms"
   ```

3. Save `.env` and **restart the dev server** (stop with Ctrl+C, then `npm run dev` again).

4. Run Prisma to apply the schema (if you haven’t already):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

After this, registration and login should connect to the database successfully.
