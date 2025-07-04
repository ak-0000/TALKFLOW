import express from "express" ;
import authRoutes from "./routes/auth.route.js" ;
import dotenv from "dotenv" ;
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser" ;


const app = express() ;
dotenv.config();

app.use(express.json()) ; // Middleware to parse JSON bodies
app.use(cookieParser()) ; // Middleware to parse cookies
app.use("/api/auth", authRoutes)
const PORT = process.env.PORT ;



app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`) ;
    connectDB();
})