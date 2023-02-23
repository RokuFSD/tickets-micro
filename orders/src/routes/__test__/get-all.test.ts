import request from "supertest"
import app from "../../app"
import Ticket, {TicketDoc} from "../../models/ticket";


async function buildTicket() {
  const ticket = Ticket.build({
    title: 'concert',
    price: 30
  })
  await ticket.save()
  return ticket
}

async function postOrder(ticket: TicketDoc, user: string[]) {
  await request(app)
  .post("/api/orders")
  .set("Cookie", user)
  .send({ticketId: ticket.id})
}


describe("Get all orders", () => {
  it("Should return an empty array if there is no orders", async () => {
    const response = await request(app)
    .get("/api/orders")
    .set('Cookie', signin())
    .send()
    .expect(200)
    expect(response.body).toEqual([])
  })

  it("Should return the orders for the current user", async () => {
    const user = signin()
    const user2 = signin()
    const ticketOne = await buildTicket()
    const ticketTwo = await buildTicket()
    const ticketThree = await buildTicket()
    await postOrder(ticketOne, user)
    await postOrder(ticketTwo, user)
    await postOrder(ticketThree, user)

    const response = await request(app)
    .get('/api/orders')
    .set("Cookie", user)
    .send()
    .expect(200)
    expect(response.body).toHaveLength(3)

    const responseUser2 = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .send()
    expect(200)
    expect(responseUser2.body).toHaveLength(0)
  })
})