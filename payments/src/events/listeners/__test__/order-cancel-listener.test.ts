import Order from "../../../models/order";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledListener} from "../order-cancel-listener";
import {OrderCancelledEvent, OrderStatus} from "@rokufsdev/common";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    version: 0,
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString()
  })

  await order.save()

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    status: OrderStatus.CANCEL,
    version: order.version + 1,
    userId: order.userId,
    ticket: {
      id: 'whatever',
      price: 30
    },
    expiresAt: 'whatever'
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return {listener, data, message}
}

describe("Order cancelled listener", () => {
  it("updated the order to cancelled status", async () => {
    const {listener, data, message} = await setup()
    await listener.onMessage(data, message)
    const orderCancelled = await Order.findById(data.id)
    expect(orderCancelled).toBeDefined()
    expect(orderCancelled!.status).toEqual(OrderStatus.CANCEL)
  })

  it("acknowledge the message", async () => {
    const {listener, data, message} = await setup()
    await listener.onMessage(data, message)
    expect(message.ack).toHaveBeenCalled()
  })
})