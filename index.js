const app = require("./app");
const cluster = require("cluster");
const os = require("os");
const numCpu = os.cpus().length;
PORT = process.env.PORT || 3001;

if (cluster.isMaster) {
  for (let i = 0; i < numCpu; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log("You app is running port " + PORT, process.pid);
  });
}
// app.listen(PORT, () => {
//   console.log("You app is running port " + PORT, process.pid);
// });
