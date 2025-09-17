import { Router } from "express";
import { registerUser } from "./../controllers/users.controller.js"  //now create controllers folder and userControoler

const userRoutes = new Router();

// Add routes
userRoutes.post('/register', registerUser);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);
export { userRoutes };



