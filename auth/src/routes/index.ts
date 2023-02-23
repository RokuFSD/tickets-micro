import express from "express";
import {currentUserRouter} from "./current-user";
import {signupRouter} from "./signup";
import {signinRouter} from "./signin";
import {signoutRouter} from "./signout";

function usersRouter() {
  const router = express.Router()
  router.use("/api/users", [currentUserRouter, signupRouter, signinRouter, signoutRouter])
  return router
}

export default usersRouter