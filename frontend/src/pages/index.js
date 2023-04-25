import { debounce } from "lodash";
import React, { useState } from "react";
import socket from "../../socket";

function sendCommand(command) {
  return function () {
    console.log("Sending the command", command);
    socket.emit("command", command);
  };
}

export default function Homepage() {
  const videoRef = React.useRef();
  const [angleReading, setAngleReading] = useState(0);

  const debouncedRotation = React.useRef(
    debounce((event) => {
      const angle = parseInt(event.target.value);

      if (angle <= 0) {
        const parsedAngle = Math.abs(angle);
        console.log("issue counter clockwise command");
        socket.emit("command", `ccw ${parsedAngle}`);
      } else {
        console.log("issue clockwise command");
        socket.emit("command", `cw ${angle}`);
      }
    }, 500)
  ).current;

  React.useEffect(() => {
    return () => {
      debouncedRotation.cancel();
    };
  }, [debouncedRotation]);

  React.useEffect(() => {
    async function getJSMpeg() {
      const JSMpeg = await import("jsmpeg");

      if (typeof window !== "undefined") {
        const canvas = videoRef.current;
        const url = `ws://localhost:3001/stream`;
        const player = new JSMpeg(url, { canvas });
      }
    }
  }, []);

  return (
    <>
      <canvas id="video-canvas" ref={videoRef} />

      <div className="flex justify-center space-x-8 py-12">
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("command")}
        >
          Connect!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("streamon")}
        >
          Stream
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("takeoff")}
        >
          Take Off!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("land")}
        >
          Land!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("flip l")}
        >
          Flip Left!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("flip f")}
        >
          Flip Forward!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("forward 100")}
        >
          Go Forward
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("back 100")}
        >
          Go Back
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("left 100")}
        >
          Go Left
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("right 100")}
        >
          Go Right
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("cw 50")}
        >
          Rotate CW!
        </button>
        <button
          className="bg-white text-black px-4 py-2 rounded-md"
          onClick={sendCommand("battery?")}
        >
          Get Battery
        </button>
      </div>

      <div className="py-12 text-white max-w-2xl mx-auto text-center">
        <p>Rotate Drone: {angleReading}deg</p>
        <input
          type="range"
          onInput={debouncedRotation}
          onChange={(e) => setAngleReading(e.target.value)}
          min={-360}
          max={360}
          step={1}
          value={angleReading}
        />
      </div>

      <div className="w-full px-24 bg-slate-50/10 py-12">
        <div className="flex justify-between">
          <div className="flex flex-col justify-center items-center">
            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("forward 100")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
            </button>

            <div className="flex space-x-4 my-4">
              <button
                className="bg-white text-black px-4 py-2 rounded-md"
                onClick={sendCommand("left 100")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>

              <button
                className="bg-white text-black px-4 py-2 rounded-md"
                onClick={sendCommand("right 100")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>

            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("back 100")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("ccw 45")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
            </button>

            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("cw 45")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("down 20")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>

            <button
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={sendCommand("up 20")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
