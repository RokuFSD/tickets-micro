import {Request, Response, Router} from "express";
import Ticket from "../models/ticket";
import {NotFoundError} from "@rokufsdev/common";


const router = Router()

router.get("/:id", async (req: Request, res: Response) => {
  const ticketId = req.params.id
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) {
    throw new NotFoundError()
  }
  res.send(ticket)
})

export default router