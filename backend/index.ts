import server from "@backend/server";

process.on("uncaughtException", error => {
  console.error(error);
  process.exit(1);
});
process.on("unhandledRejection", error => {
  console.error(error);
  process.exit(1);
});

(async () => {
  try {
    await server.listen(8500, "0.0.0.0");
    console.log(`server listening on ${JSON.stringify(server.server.address())}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
