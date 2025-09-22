import { Router } from "express";
import {
  registerUser,
  getAllUsers,
  userLogin,
  userLogout,
  newRefreshToken,
  changeUserPassword,
  getCurrentUser
} from "./../controllers/users.controller.js"  //now create controllers folder and userControoler
import { upload } from "./../middlewares/multer.middleware.js";
import jwtverify from '../middlewares/auth.middleware.js';
const userRoutes = new Router();

// Add routes
userRoutes.get('/allusers', getAllUsers);
userRoutes.post('/register', upload.fields([
  { name: "avator", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), registerUser);
userRoutes.post('/login', userLogin);
userRoutes.post('/logout', jwtverify, userLogout);
userRoutes.post('/refresh-token', newRefreshToken);
userRoutes.post('/change-password', jwtverify, changeUserPassword);
userRoutes.post('/current-user', jwtverify, getCurrentUser);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);
export { userRoutes };



