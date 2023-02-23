import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import Ticket from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCancelledEvent} from "@rokufsdev/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: "my title",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
  })

  ticket.set({orderId})

  await ticket.save()

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  //@ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return {data, listener, message, ticket, orderId}
}

describe("Order cancelled event", () => {
  it("updates the ticket, publishes an event, and acknowledges the message", async () => {
    const {message, data, ticket, orderId, listener} = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).not.toBeDefined()

    expect(message.ack).toHaveBeenCalled()

    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
})