const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const nicknames = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("request nickname");

  socket.on("set nickname", (nickname) => {
    nicknames[socket.id] = nickname;
    socket.broadcast.emit("user connected", nickname + " has connected.");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    const nickname = nicknames[socket.id];
    delete nicknames[socket.id];
    socket.broadcast.emit("user disconnected", nickname + " has disconnected.");
  });

  socket.on("chat message", (msg) => {
    const senderNickname = nicknames[socket.id];

    socket.emit("chat message", { sender: "You", message: msg });

    socket.broadcast.emit("chat message", {
      sender: senderNickname,
      message: msg,
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
