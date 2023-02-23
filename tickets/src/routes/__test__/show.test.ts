import request from "supertest"
import app from "../../app";
import mongoose from "mongoose";

describe("Get route", () => {
  it("returns a 404 if a ticket is not found", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404)
  })

  it("return the ticket", async () => {
    const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({title: 'test', price: 20, userId: '2020'})
    .expect(201)
    await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send()
    .expect(200, ticket.body)
  })
})