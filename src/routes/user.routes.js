import { Router } from "express";
import { registerUser } from "./../controllers/users.controller.js"  //now create controllers folder and userControoler
import { upload } from "./../middlewares/multer.middleware.js";
const userRoutes = new Router();

// Add routes
userRoutes.post('/register', upload.fields([
  { name: "avator", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), registerUser);


// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);
export { userRoutes };



