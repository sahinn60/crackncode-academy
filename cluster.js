const cluster = require("cluster");
const os = require("os");

const WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[Cluster] Primary ${process.pid} started — spawning ${WORKERS} workers`);

  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.log(`[Cluster] Worker ${worker.process.pid} died (${signal || code}). Restarting…`);
    cluster.fork();
  });
} else {
  require("./server");
  console.log(`[Cluster] Worker ${process.pid} started`);
}
