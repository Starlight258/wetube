import express from "express";
import {
  getEdit,
  postEdit,
  remove,
  logout,
  see,
} from "../controllers/userController";
import { avatarUpload } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter
  .route("/edit")
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/remove", remove);
userRouter.get("/:id", see);

export default userRouter;
