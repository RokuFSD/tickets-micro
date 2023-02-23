import express from "express"
import showRouter from "./show"
import newTicketRouter from "./new-ticket"
import getAllRouter from "./get-all"
import updateTicketRouter from "./update-ticket"

export default function ticketRouter() {
  const router = express.Router()
  router.use("/api/tickets", [newTicketRouter, showRouter, getAllRouter, updateTicketRouter])
  return router
}