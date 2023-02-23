import {TicketUpdatedEvent} from "@rokufsdev/common";
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import Ticket from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  await ticket.save()

  // create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    price: 400,
    title: 'no-concert',
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }
  return {listener, data, message, ticket}
}


describe("Ticket updated listener", () => {

  it("updates a ticket", async () => {
    const {listener, data, message, ticket} = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, message)

    const ticketUpdated = await Ticket.findById(ticket.id)

    // write assertions to make sure a ticket was created!
    expect(ticketUpdated).toBeDefined();
    expect(ticketUpdated!.title).toEqual(data.title);
  })

  it("acks the message", async () => {
    const {listener, data, message} = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, message)

    // write assertions to make sure ack is called
    expect(message.ack).toHaveBeenCalledTimes(1)
  })

  it("does not call ack if the event has a skipped version number", async () => {
    const { message, data, listener} = await setup();

    data.version = 10;

    await expect(listener.onMessage(data, message)).rejects.toThrow("Ticket not found")
  })
})