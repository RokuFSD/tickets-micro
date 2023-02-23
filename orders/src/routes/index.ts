import express from "express"
import getOne from "./get-one";
import getAll from "./get-all";
import deleteOne from "./delete";
import newOrder from "./new"


export default function ordersRouter() {
  const router = express.Router()
  router.use("/api/orders", [getOne, getAll, newOrder, deleteOne])
  return router
}