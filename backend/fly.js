const dgram = require("dgram");
const app = require("express")();
const http = require("http");
const guiServer = require("http").Server(app);
const wait = require("waait");
const WebSocket = require("ws");
const io = require("socket.io")(guiServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// const throttle = require("lodash/throttle");
// const commandDelays = require("./commandDelays");

const HOST = "192.168.10.1";
const PORT = 8889;

// Stream config
const STREAM_PORT = 3001;

// We'll spawn ffmpeg as a separate process
const spawn = require("child_process").spawn;

const streamServer = http
  .createServer(function (request, response) {
    console.log(
      `Stream Server: Received request ${request.socket.remoteAddress} : ${request.socket.remotePort}`
    );

    // When data comes from FFmpeg, send it to the web socket
    request.on("data", function (data) {
      webSocketServer.broadcast(data);
    });
  })
  .listen(STREAM_PORT);

const webSocketServer = new WebSocket.Server({
  server: streamServer,
});

webSocketServer.broadcast = (data) => {
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Delay for 3 seconds before we start ffmpeg
setTimeout(function () {
  var args = [
    "-i",
    "udp://0.0.0.0:11111",
    "-r",
    "30",
    "-s",
    "960x720",
    "-codec:v",
    "mpeg1video",
    "-b",
    "800k",
    "-f",
    "mpegts",
    "http://127.0.0.1:3001/stream",
  ];

  // Spawn an ffmpeg instance
  var streamer = spawn("ffmpeg", args);
  // Uncomment if you want to see ffmpeg stream info
  streamer.stderr.pipe(process.stderr);
  streamer.on("exit", function (code) {
    console.log("Failure", code);
  });
}, 3000);

const drone = dgram.createSocket("udp4");
drone.bind(PORT);

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

const droneState = dgram.createSocket("udp4");
droneState.bind(8890);

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

// const commands = ["command", "battery?", "takeoff", "flip r", "land"];
// const commands = ['command', 'battery?'];

// let i = 0;

// drone.send("command", 0, "command".length, PORT, HOST, handleError);

// async function go() {
//   const command = commands[i];
//   const delay = commandDelays[command];
//   console.log(`running command: ${command}`);
//   drone.send(command, 0, command.length, PORT, HOST, handleError);
//   await wait(delay);
//   i += 1;
//   if (i < commands.length) {
//     return go();
//   }
//   console.log("done!");
// }

// go();

io.on("connection", (socket) => {
  socket.on("command", async (command) => {
    console.log("command Sent from browser");
    console.log(command);

    await wait(300);

    drone.send(command, 0, command.length, PORT, HOST, handleError);
  });

  socket.emit("status", "CONNECTED");
});

// droneState.on(
//   "message",
//   throttle((state) => {
//     if (state) {
//       const formattedState = parseState(state.toString());
//       console.log(formattedState);
//       io.sockets.emit("dronestate", formattedState);
//     }
//   }, 100)
// );

guiServer.listen(6767, () => {
  console.log("Socket io server up and running");
});
