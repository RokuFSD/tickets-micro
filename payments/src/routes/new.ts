import {Request, Response, Router} from "express";
import {body} from "express-validator"
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus
} from "@rokufsdev/common";
import Order from "../models/order"
import {stripe} from "../stripe";
import Payment from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = Router()

const validatorOptions = [
  body('token')
  .not()
  .isEmpty(),
  body('orderId')
  .not()
  .isEmpty()

]

router.post("/", requireAuth, validatorOptions, validateRequest, async (req: Request, res: Response) => {
  const {token, orderId} = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError()
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  if (order.status === OrderStatus.CANCEL) {
    throw new BadRequestError("The order is cancelled")
  }

  const stripeCharge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token
  })

  const payment = Payment.build({
    orderId,
    stripeId: stripeCharge.id
  })

  await payment.save()

  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  })

  res.status(201).send({id: payment.id})

})

export default router