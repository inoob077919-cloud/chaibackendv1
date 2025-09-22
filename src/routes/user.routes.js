import { Router } from "express";
import {
  registerUser,
  getAllUsers,
  userLogin,
  userLogout,
  newRefreshToken,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatorFile,
  updateCoverImage
} from "./../controllers/users.controller.js"  //now create controllers folder and userControoler
import { upload } from "./../middlewares/multer.middleware.js";
import jwtverify from '../middlewares/auth.middleware.js';
import { validateFields } from '../middlewares/validateField.middleware.js';
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
userRoutes.post('/profile-update', validateFields(["email", "fullName"]), jwtverify, updateAccountDetails);
userRoutes.post('/avator-update', jwtverify, upload.single("avator"), updateAvatorFile);
userRoutes.post('/coverimage-update', jwtverify, upload.single("coverImage"), updateCoverImage)
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);
export { userRoutes };



