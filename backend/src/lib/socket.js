import {Server} from "socket.io"
import http from "http"
import express from "express"
import cors from "cors"

const app = express() ;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use((req, res, next) => {
  console.log("🔍 Incoming origin:", req.headers.origin);
  next();
});



const server = http.createServer(app)

const io = new Server(server , {
    cors : {
        origin : ["http://localhost:5173"]
    }
})


const userSocketMap = {}  ; // used to store the online users 

io.on("connection" , (socket) => {
    console.log("a user connected" , socket.id)
    const userId = socket.handshake.query.userId ; 
    if(userId) userSocketMap[userId] =  socket.id

    io.emit("getOnlineUsers" , Object.keys(userSocketMap))


    socket.on("disconnect" , () => {
        console.log("a user disconnected" , socket.id)
        delete userSocketMap[userId]
         io.emit("getOnlineUsers" , Object.keys(userSocketMap))
    })
})


export function  getRecieverSocketId (userId)  {
    return userSocketMap[userId];
}

export {io , app , server}