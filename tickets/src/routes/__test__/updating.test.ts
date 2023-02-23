import request from "supertest";
import app from "../../app";
import Ticket from "../../models/ticket";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";

function createTicket() {
  return request(app)
  .post("/api/tickets")
  .set("Cookie", signin())
  .send({title: 'test', price: 20})
  .expect(201)
}

describe("Update tickets handler", () => {
  it("returns 404 when the ticket don't exist", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .patch(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'valid title',
      price: 20
    })
    .expect(404)
  })

  it("return a 401 if the user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .patch(`/api/tickets/${id}`)
    .send({
      title: 'valid title',
      price: 20
    })
    .expect(401)
  })

  it("return a 401 if the user does not own the ticket", async () => {
    const ticket = await createTicket()
    await request(app)
    .patch(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'valid title',
      price: 20
    })
    .expect(401)
  })

  it("returns an error if an invalid title or is provided", async () => {
    const ticket = await createTicket()
    await request(app)
    .patch(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin())
    .send({
      title: "",
      price: 10
    })
    .expect(400)
    await request(app)
    .patch(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', signin())
    .send({
      price: 10
    })
    .expect(400)
  })

  it("updates a ticket with valid inputs", async () => {
    const user = signin()
    const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", user)
    .send({title: 'test', price: 20})
    .expect(201)
    await request(app)
    .patch(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', user)
    .send({
      title: "newTitleTest",
      price: 20
    })
    .expect(200)
    const updatedTicket = await Ticket.findById(ticket.body.id)
    expect(updatedTicket!.title).toEqual("newTitleTest")
  })

  it("publishes an event", async () => {
    const user = signin()
    const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", user)
    .send({title: 'test', price: 20})
    .expect(201)
    await request(app)
    .patch(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', user)
    .send({
      title: "newTitleTest",
      price: 20
    })
    .expect(200)
    const updatedTicket = await Ticket.findById(ticket.body.id)
    expect(updatedTicket!.title).toEqual("newTitleTest")
    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })

  it("fails when a ticket is reserved", async () => {
    const user = signin()
    const ticketResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", user)
    .send({title: 'test', price: 20})

    const ticket = await Ticket.findById(ticketResponse.body.id)
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()})
    await ticket!.save()

    await request(app)
    .patch(`/api/tickets/${ticket!.id}`)
    .set('Cookie', user)
    .send({
      title: "newTitleTest",
      price: 20
    })
    .expect(400)
  })
})