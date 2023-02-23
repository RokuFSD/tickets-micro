import express from "express";
import newCharge from "./new"

export default function paymentsRouter(){
  const router = express.Router()
  router.use("/api/payments", [newCharge])
  return router
}