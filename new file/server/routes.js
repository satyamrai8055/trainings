import user from "./api/v1/controllers/user/routes";
import admin from "./api/v1/controllers/admin/routes";
import shop from "./api/v1/controllers/shop/routes";
import category from "./api/v1/controllers/category/routes";
import product from "./api/v1/controllers/product/routes";
import chat from "./api/v1/controllers/chat/routes";
import hospital from './api/v1/controllers/hospital/routes'
import doctor from './api/v1/controllers/doctor/routes'




export default function routes(app) {
  app.use("/api/v1/user", user);
  app.use("/api/v1/admin", admin);
  app.use("/api/v1/shop", shop);
  app.use("/api/v1/category", category);
  app.use("/api/v1/product", product);
  app.use("/api/v1/chat", chat);
  app.use("/api/v1/hospital",hospital)
  app.use("/api/v1/doctor", doctor)
}
