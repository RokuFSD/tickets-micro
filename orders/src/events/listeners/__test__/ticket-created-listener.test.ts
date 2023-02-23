import {TicketCreatedEvent} from "@rokufsdev/common";
import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import Ticket from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }
  return {listener, data, message}

}


describe("Ticket created listener", () => {

  it("creates and saves a ticket", async () => {
    const {listener, data, message} = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, message)

    // write assertions to make sure a ticket was created!
    const ticketCreated = await Ticket.findById(data.id)

    expect(ticketCreated).toBeDefined();
    expect(ticketCreated!.title).toEqual(data.title);

  })

  it("acks the message", async () => {
    const {listener, data, message} = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, message)

    // write assertions to make sure ack is called
    expect(message.ack).toHaveBeenCalledTimes(1)
  })
})