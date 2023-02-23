import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteListener} from "../expiration-complete-listener";
import Ticket from "../../../models/ticket";
import Order from "../../../models/order";
import mongoose from "mongoose";
import {OrderStatus, ExpirationCompleteEvent} from "@rokufsdev/common"
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20
  })

  await ticket.save()

  const order = Order.build({
    ticket,
    status: OrderStatus.CREATED,
    userId: "a user",
    expiresAt: new Date()
  })

  await order.save()

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id
  }

  //@ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return {message, data, listener, ticket, order}

}

describe("Expiration complete listener", () => {
  it("updates the order status to cancelled", async () => {
    const {message, data, listener, order} = await setup()
    await listener.onMessage(data, message)

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.CANCEL)
  })

  it("emit an OrderCancelled event", async () => {
    const {message, data, listener, order} = await setup()
    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id);

  })

  it("ack the message", async () => {
    const {message, data, listener, order} = await setup()
    await listener.onMessage(data, message)

    expect(message.ack).toHaveBeenCalled()
  })
})