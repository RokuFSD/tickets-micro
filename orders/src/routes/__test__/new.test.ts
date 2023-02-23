import mongoose from "mongoose";
import request from "supertest"
import app from "../../app";
import Ticket from "../../models/ticket";
import Order from "../../models/order";
import {OrderStatus} from "@rokufsdev/common";
import {natsWrapper} from "../../nats-wrapper";

describe("New order", () => {
  it("Returns an error if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .post("/api/orders")
    .set('Cookie', signin())
    .send({
      ticketId
    })
    .expect(404)
  })

  it("Returns an error if the ticket is already reserved", async () => {
    const ticket = Ticket.build({title: 'New Ticket', price: 20})
    await ticket.save()
    const order = Order.build({
      userId: 'randomuser',
      status: OrderStatus.CREATED,
      expiresAt: new Date(),
      ticket: ticket
    })
    await order.save()

    await request(app)
    .post("/api/orders")
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400)
  })

  it("Reserves a ticket", async () => {
    const ticket = Ticket.build({title: 'New Ticket', price: 20})
    await ticket.save()

    await request(app)
    .post("/api/orders")
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201)
  })

  it("emits an order created event", async () => {
    const ticket = Ticket.build({title: 'New Ticket', price: 20})
    await ticket.save()

    await request(app)
    .post("/api/orders")
    .set('Cookie', signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
})