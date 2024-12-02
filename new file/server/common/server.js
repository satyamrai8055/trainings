import express from "express";
import mongoose from "mongoose";
import http from "http";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import controller from '../api/v1/controllers/admin/controller';
import apiErrorHandler from '../helper/apiErrorHandler'
const app = express();
const server = http.createServer(app);
import * as path from "path";
const root = path.normalize(`${__dirname}/../..`);



class ExpressServer {
  constructor() {
    app.use(express.json({ limit: '1000mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
    app.use(fileUpload({useTempFiles:true}));
     }
  router(routes) {
    routes(app);
    return this;
  }
  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/admin/*.js`),
        path.resolve(`${root}/server/api/v1/controllers/user/*.js`),
        path.resolve(`${root}/server//api/v1/controllers/hospital/*.js`),
      ],
    };
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }
  handleError() {
    app.use(apiErrorHandler);

    return this;
  }
  configureDb(dbConnection) {
    return new Promise((resolve, reject) => {
      mongoose.connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
          console.log("MongoDB connection established!!");
          resolve(this);
        })
        .catch((err) => {
          console.error(`Error in MongoDB connection: ${err.message}`);
          reject(err);
        });
    });
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`, new Date().toLocaleString());
    });
  }
}

export default ExpressServer;







