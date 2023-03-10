import request from "supertest";
import app from "../../app";
import Ticket from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper"

describe("New Ticket route", () => {
  it("has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app)
    .post("/api/tickets")
    .send({})
    expect(response.status).not.toEqual(404)
  })

  it("can only be accessed if the user is signed in", async () => {
    const response = await request(app)
    .post("/api/tickets")
    .send({})
    expect(response.status).toEqual(401)
  })

  it("not returns 401 when the user is logged in", async () => {
    const response = await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({})
    expect(response.status).not.toEqual(401)
  })


  it("returns an error if an invalid title is provided", async () => {
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      title: "",
      price: 10
    })
    .expect(400)
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      price: 10
    })
    .expect(400)
  })

  it("returns an error if an invalid price is provided", async () => {
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      title: "titletest",
      price: -10
    })
    .expect(400)
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      title: "titletest",
    })
    .expect(400)
  })

  it("creates a ticket with valid inputs", async () => {
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      title: "titletest",
      price: 20
    })
    .expect(201)

    const tickets = await Ticket.count()
    expect(tickets).toBe(1)
  })

  it("publishes an event", async () => {
    await request(app)
    .post("/api/tickets")
    .set('Cookie', signin())
    .send({
      title: "titletest",
      price: 20
    })
    .expect(201)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
})