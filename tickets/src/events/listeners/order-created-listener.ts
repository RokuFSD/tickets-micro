import {Channels, Listener, OrderCreatedEvent, QGroups} from "@rokufsdev/common";
import {Message} from "node-nats-streaming";
import Ticket from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Channels.ORDER_CREATED;
  readonly queueGroupName = QGroups.TICKETS_SERVICE;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket!.id);

    // If no ticket throw Error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as being reserved by setting its orderId
    ticket.set({orderId: data.id});

    // Save the ticket
    await ticket.save()

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    })

    // Ack the message
    msg.ack()
  }

}