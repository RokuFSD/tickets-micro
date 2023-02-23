import {OrderCreatedListener} from "../order-created-listener";
import {OrderCreatedEvent, OrderStatus} from "@rokufsdev/common"
import Ticket from "../../../models/ticket";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'my title',
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString()
  })

  await ticket.save()

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    version: 0,
    expiresAt: 'fake value',
    ticket: {
      id: ticket.id
    },
  }

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return {data, listener, message, ticket}
}

describe("Order created listener", () => {
  it("sets the orderId of the ticket", async () => {
    const {listener, ticket, data, message} = await setup()

    await listener.onMessage(data, message)

    const ticketUpdated = await Ticket.findById(ticket.id)

    expect(ticketUpdated!.orderId).toBeDefined()
    expect(ticketUpdated!.orderId).toEqual(data.id)
  })

  it("acknowledge the message", async () => {
    const {listener, data, message} = await setup()

    await listener.onMessage(data, message)

    expect(message.ack).toHaveBeenCalled()
  })

  it("publishes a ticket updated event", async () => {
    const {listener, data, message} = await setup()

    await listener.onMessage(data, message)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

  })
})