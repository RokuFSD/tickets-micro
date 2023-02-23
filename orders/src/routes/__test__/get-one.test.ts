import request from "supertest"
import app from "../../app";
import Ticket from "../../models/ticket";

describe("Get one order", () => {
  it("fetches the order", async () => {
    // Create a ticket
    const ticket = Ticket.build({
      title: 'concert',
      price: 30
    })
    await ticket.save()
    const user = signin()

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
    .post("/api/orders")
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201)

    // make request to fetch the order
    await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)
  })

  it("returns an error if an user tries to fetch another user's order", async () => {
    const ticket = Ticket.build({
      title: 'concert',
      price: 30
    })
    await ticket.save()
    const user = signin()

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
    .post("/api/orders")
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201)

    await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401)
  })
})