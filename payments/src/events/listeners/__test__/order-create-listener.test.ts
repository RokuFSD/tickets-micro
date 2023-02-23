import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import Order from "../../../models/order";
import mongoose from "mongoose";
import {OrderCreatedEvent, OrderStatus} from "@rokufsdev/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    version: 0,
    userId: 'whatever',
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

describe("Order created listener", () => {
  it("replicates the order info", async () => {
    const {listener, data, message} = await setup()
    await listener.onMessage(data, message)
    const orderCreated = await Order.findById(data.id)
    expect(orderCreated).toBeDefined()
    expect(orderCreated!.price).toEqual(data.ticket!.price)
  })

  it("acknowledge the message", async () => {
    const {listener, data, message} = await setup()
    await listener.onMessage(data, message)
    expect(message.ack).toHaveBeenCalled()
  })
})