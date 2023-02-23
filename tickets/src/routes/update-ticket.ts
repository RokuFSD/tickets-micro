import {Request, Response, Router} from "express"
import {requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError} from "@rokufsdev/common"
import {body} from "express-validator";
import Ticket from "../models/ticket";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsWrapper} from "../nats-wrapper";

const validatorOptions = [
  body('title')
  .not().isEmpty()
  .withMessage('Title is required'),
  body('price')
  .isFloat({gt: 0})
  .withMessage('Price must be greater than 0')
]

const router = Router()

router.patch("/:id", requireAuth, validatorOptions, validateRequest, async (req: Request, res: Response) => {
  const ticketId = req.params.id
  const userId = req.currentUser!.id
  const {title, price} = req.body
  const ticket = await Ticket.findById(ticketId)

  if (!ticket) {
    throw new NotFoundError()
  }

  if(ticket.orderId){
    throw new BadRequestError("You can't edit a ticket with an order");
  }

  if (ticket.userId !== userId) {
    throw new NotAuthorizedError()
  }

  ticket.set({title, price})
  await ticket.save()

  await new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  })

  res.json(ticket)
})


export default router