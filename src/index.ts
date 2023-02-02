// IMPORTS
import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import { IPrivateMessage } from "./types/socket";

// ENVIRONMENT VARIABLES
dotenv.config();

// EXPRESS
const app: Express = express();

// BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// PORT
const port = process.env.PORT || 5000;

// SERVER
const server = http.createServer(app);

// GET API
app.get("/", (req: Request, res: Response) => {
  res.send("NODE SOCKET");
});

// SOCKET IO
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173"], // Frontend URL
  },
});

io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });

  // Emit Event (All Client's)
  socket.on("message", (msg: string) => {
    console.log("Message from Client: " + msg);
    io.emit("message", msg);
  });

  // Broadcast Event (All Client's except the sender)
  socket.on("broadcast", (msg: string) => {
    socket.broadcast.emit("message", msg);
  });

  /**
   * Join Room Event (Private Channel)
   * Please note that rooms are a server-only concept
   */
  socket.on("joinRoom", (room: string, callback) => {
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
    // Acknowlegdement
    callback({
      status: 200,
      message: `Joined Room - ${room}`,
    });
  });

  // Private Message Event (Room message)
  socket.on("privateMessage", (info: IPrivateMessage) => {
    const message: string = `${socket.id} - ${info.message}`;
    socket.to(info.room).emit("message", message);
  });
});

// RUN SERVER ON SPECIFIED PORT
server.listen(port, () => console.log(`Server: http://localhost:${port}`));
