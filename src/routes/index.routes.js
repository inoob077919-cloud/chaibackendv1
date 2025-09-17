import { Router } from 'express';
import { userRoutes } from "./user.routes.js"
const routes = new Router();

routes.use("/api/v1/users", userRoutes);

export { routes }


