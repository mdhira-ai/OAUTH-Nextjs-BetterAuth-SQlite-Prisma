const { Server } = require("socket.io");
const { createServer } = require("http");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Your Next.js app URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send welcome message
  socket.emit("welcome", {
    message: "Welcome to the socket server!",
    timestamp: new Date().toISOString()
  });

  // Listen for messages from client
  socket.on("message", (data) => {
    console.log("Received message:", data);
    
    // Echo the message back to the client
    socket.emit("message", {
      ...data,
      echo: true,
      serverTimestamp: new Date().toISOString()
    });

    // Broadcast to all other clients
    socket.broadcast.emit("message", {
      ...data,
      broadcast: true,
      from: socket.id
    });
  });

  // Handle custom events
  socket.on("user-action", (data) => {
    console.log("User action:", data);
    socket.emit("user-action-response", {
      received: data,
      status: "success"
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});