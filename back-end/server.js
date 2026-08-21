// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { connectToDatabase } from "./config/db.js";
// import  authRouter from './routes/authRoutes.js';
// import projectRouter from './routes/projectRoutes.js';

// const app = express();

//  await connectToDatabase()

// app.use(cors({origin: process.env.ORIGINS.split(","), credentials: true}))
// app.use(cookieParser())
// app.use(express.json())

// app.get("/", (req, res)=> res.send("Server is live!"))
// app.use('/api/auth', authRouter)
// app.use("/api/projects", projectRouter)
 
// // Centralized error handler
// app.use((err, _req, res, _next)=>{
//     console.error(`[Error] ${err.message}`);
//     res.status(500).json({error: err.message})
// })

// const port = process.env.PORT || 3000;

// app.listen(port, ()=>{
//     console.log(`Server is running at http://localhost:${port}`)
// })
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';

const app = express();

await connectToDatabase();

// Clean split for CORS origins to prevent trailing spaces/slashes breaking cookies
const allowedOrigins = process.env.ORIGINS
    ? process.env.ORIGINS.split(",").map(o => o.trim().replace(/\/$/, ""))
    : ["http://localhost:5173", "http://localhost:3000"];

// app.use(cors({
//     origin: allowedOrigins,
//     credentials: true
// }));

// Replace your current app.use(cors(...)) with this:
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl) or local dev origins
        if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is live!"));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});