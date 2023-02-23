import Ticket from "../ticket";

describe("Ticket model", () => {
  it("Implements optimistic concurrency control", async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
      title: 'My title',
      price: 20,
      userId: 'Undefined'
    })

    // Save the ticket to the database
    await ticket.save()

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    // Make two separate changes to the tickets we fetched
    firstInstance!.set({price: 30})
    secondInstance!.set({price: 9000})

    // Save the first fetched ticket
    await firstInstance!.save()

    // Save the second fetched ticket
    expect(async () => {
      await secondInstance!.save()
    })
    .rejects
    .toThrowError()
  })

  it("should increment the version number on multiple saves", async () => {
    const ticket = Ticket.build({
      title: 'My title',
      price: 20,
      userId: 'Ok'
    })

    await ticket.save()
    expect(ticket.version).toEqual(0)
    await ticket.save()
    expect(ticket.version).toEqual(1)
  })
})