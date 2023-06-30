const dgram = require("dgram");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const wait = require("waait");
const throttle = require("lodash/throttle");

// const commandDelays = require("./commandDelays");

const PORT = 8889;
const STATE_PORT = 8890;
const HOST = "192.168.10.1";

// Create udp4 socket
const drone = dgram.createSocket("udp4");

// Bind to our port
drone.bind(PORT);

// Create udp4 socket for drone state
const droneState = dgram.createSocket("udp4");

// Bind to our port
droneState.bind(STATE_PORT);

drone.on("message", (message) => {
  console.log(`🤖 : ${message}`);
  io.sockets.emit("status", message.toString());
});

function handleError(err) {
  if (err) {
    console.log("ERROR");
    console.log(err);
  }
}

io.on("connection", (socket) => {
  socket.on("command", async (command) => {
    console.log("command Sent from browser");
    console.log(command);

    await wait(300);

    drone.send(command, 0, command.length, PORT, HOST, handleError);
  });

  socket.emit("status", "CONNECTED");
});

function parseState(state) {
  if (state?.length > 0) {
    return state
      .map((x) => x.split(":"))
      .reduce((data, [key, value]) => {
        data[key] = value;
        return data;
      }, {});
  }

  return "";
}

droneState.on(
  "message",
  throttle((state) => {
    if (state) {
      const formattedState = parseState(state.toString());
      io.sockets.emit("dronestate", formattedState);
    }
  }, 100)
);

http.listen(6767, () => {
  console.log("Socket io server up and running");
});
