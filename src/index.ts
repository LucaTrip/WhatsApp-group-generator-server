import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { kross } from "./kross";
import { createWhatsappSession } from "./wa";
import { SocketListenEvents } from "./models/types";
const { MongoStore } = require("wwebjs-mongo");

dotenv.config();

const corsOptions: cors.CorsOptions = {
  origin: "http://localhost:3000",
  // origin: "https://whatsapp-group-client-3363ee97cbe7.herokuapp.com",
};
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/kross", kross);

// socket connection with client
io.on(SocketListenEvents.connection, (socket) => {
  console.log("socket connection with client", socket.id);

  createWhatsappSession(socket, "store");

  socket.on(SocketListenEvents.disconnect, () => {
    console.log("socket disconnected");
    socket.emit("socket_disconnected");
  });

  /* mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("mongodb connected");
      // const store = new MongoStore({ mongoose: mongoose });


    })
    .catch((err) => console.log("mongodb connection error", err)); */
});

server.listen(process.env.PORT, () => {
  return console.log(`Express is listening on ${process.env.PORT}`);
});
