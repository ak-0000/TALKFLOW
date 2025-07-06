import express from "express" ;
import authRoutes from "./routes/auth.route.js" ;
import dotenv from "dotenv" ;
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser" ;
import messageRoutes from "./routes/message.route.js" ;
import cors from "cors" ;
import { app , server } from "./lib/socket.js";

dotenv.config();


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser()) ; // Middleware to parse cookies
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    
    credentials: true, // Allow cookies to be sent with requests
})) ; // Middleware to enable CORS

app.use("/api/auth", authRoutes)
app.use("/api/messages" , messageRoutes)


const PORT = process.env.PORT ;



server.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`) ;
    connectDB();
})