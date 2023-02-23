import request from "supertest"
import app from "../../app";

function createTicket() {
  return request(app)
  .post("/api/tickets")
  .set("Cookie", signin())
  .send({title: 'test', price: 20, userId: '2020'})
  .expect(201)
}

describe("Get all route", () => {
  it("Should return all the tickets", async () => {
    await createTicket()
    await createTicket()
    await createTicket()

    const response = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200)
    expect(response.body.length).toEqual(3)
  })
})