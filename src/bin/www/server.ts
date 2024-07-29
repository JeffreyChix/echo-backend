import * as dotenv from "dotenv";
import http from "http";

dotenv.config();

import app from "../../app";

const server = http.createServer(app);

const normalizePort = (val: string): number | false => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) return false;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

server.listen(port, () => {
  console.log(`Echo server running on port ${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
});
