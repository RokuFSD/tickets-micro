import Ticket from "../models/ticket";
import {body} from "express-validator"
import {natsWrapper} from "../nats-wrapper";
import {Request, Response, Router} from "express"
import {requireAuth, validateRequest} from "@rokufsdev/common"
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";

const validatorOptions = [
  body('title')
  .not()
  .isEmpty()
  .withMessage('Title is required'),
  body('price')
  .isFloat({gt: 0})
  .withMessage('Price must be greater than 0')
]

const router = Router()

router.post("/", requireAuth, validatorOptions, validateRequest, async (req: Request, res: Response) => {
  const {title, price} = req.body

  const ticket = Ticket.build({title, price, userId: req.currentUser!.id})
  await ticket.save()

  await new TicketCreatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  })

  res.status(201).send(ticket)
})

export default router