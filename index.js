const app = require("./app");
const cluster = require("cluster");
const os = require("os");
const numCpu = os.cpus().length;
PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("You app is running port " + PORT, process.pid);
});
