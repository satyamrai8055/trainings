import Config from "config";
import Server from "./common/server";
import Routes from "./routes";

const dbConnection = `mongodb://0.0.0.0:${Config.get(
  "databasePort"
)}/${Config.get("databaseName")}`;
const server = new Server()
  .router(Routes)
  .configureSwagger(Config.get("swaggerDefinition"))
  .handleError()
  .configureDb(dbConnection)
  .then((_server) => _server.listen(Config.get("port")));
export default server;
