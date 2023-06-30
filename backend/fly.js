const dgram = require("dgram");
const app = require("express")();
const http = require("http").Server(app);
const wait = require("waait");
const throttle = require("lodash/throttle");
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const commandDelays = require("./commandDelays");

// Assign the port number to a variable
const DRONE_PORT = 8889;
const DRONE_HOST = "192.168.10.1";
const STATE_PORT = 8890;

// Create udp4 socket for drone commands and state
const drone = dgram.createSocket("udp4");
const droneState = dgram.createSocket("udp4");

// Bind the port to the socket
drone.bind(DRONE_PORT);
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
    console.log("Command Sent from browser ->", command);

    const delay = commandDelays[command] || undefined;

    if (delay) {
      await wait(delay);
    }

    drone.send(command, 0, command.length, DRONE_PORT, DRONE_HOST, handleError);
  });

  socket.emit("status", "CONNECTED");
});

function parseState(state) {
  if (state?.length > 0) {
    return state
      .map((x) => x.split(";"))
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
