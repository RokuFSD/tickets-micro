import request from "supertest"
import app from "../../app";
import Ticket from "../../models/ticket";
import {OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";

describe("Delete a order", () => {
  it("Marks an order as cancelled", async () => {
    // create a ticket with Ticket model
    const ticket = Ticket.build({
      title: "concert",
      price: 20
    })

    await ticket.save()

    const user = signin()
    // request to create an order

    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ticketId: ticket.id})
    .expect(201)

    // request to cancel the order
    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204)

    // make sure the order is cancelled

    const updatedOrder = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    expect(updatedOrder.body.status).toBe(OrderStatus.CANCEL)
  })

  it("emits an order cancelled event", async () => {
    // create a ticket with Ticket model
    const ticket = Ticket.build({
      title: "concert",
      price: 20
    })

    await ticket.save()

    const user = signin()
    // request to create an order

    const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ticketId: ticket.id})
    .expect(201)

    // request to cancel the order
    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204)

    // make sure the order is cancelled

    const updatedOrder = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    expect(updatedOrder.body.status).toBe(OrderStatus.CANCEL)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
})