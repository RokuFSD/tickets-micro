import mongoose from "mongoose";
import Order from "../models/order";
import Ticket from "../models/ticket";
import {Request, Response, Router} from "express"
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@rokufsdev/common"
import {body} from "express-validator";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = Router()

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const validatorOptions = [
  body("ticketId")
  .not()
  .isEmpty()
  .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
  .withMessage("ticketId must be provided")
]

router.post("/", requireAuth, validatorOptions, validateRequest, async (req: Request, res: Response) => {
  // Find the ticket the user is trying to order in the database
  const {ticketId} = req.body
  const ticket = await Ticket.findById(ticketId)
  if (!ticket) {
    throw new NotFoundError()
  }

  // Make sure that this ticket is not already reserved
  // Run query to look at all orders. Find an order where the ticket is the ticket we just found and
  // the order status is not cancelled
  const isReserved = await ticket.isReserved()

  if (isReserved) {
    throw new BadRequestError("Ticket is already reserved")
  }

  // Calculate an expiration data for this order
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build the order and save it to the database
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.CREATED,
    ticket,
    expiresAt: expiration
  })

  await order.save()

  // Publish and event saying that an order was created
  await new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    },
    version: order.version
  })

  res.status(201).send(order);
})

export default router