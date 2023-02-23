import {natsWrapper} from "../nats-wrapper";
import Order, {OrderStatus} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {Router, Request, Response} from "express"
import {NotAuthorizedError, NotFoundError, requireAuth} from "@rokufsdev/common";

const router = Router()

router.delete("/:orderId", requireAuth, async (req: Request, res: Response) => {
  const {orderId} = req.params;

  const order = await Order.findById(orderId).populate("ticket")

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  order.status = OrderStatus.CANCEL;
  await order.save()

  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  })

  res.status(204).send(order)
})

export default router