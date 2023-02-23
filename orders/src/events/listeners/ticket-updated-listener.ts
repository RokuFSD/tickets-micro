import {Message} from "node-nats-streaming";
import {Channels, Listener, QGroups, TicketUpdatedEvent} from "@rokufsdev/common"
import Ticket from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Channels.TICKET_UPDATED
  readonly queueGroupName = QGroups.ORDERS_SERVICE

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const {title, price} = data
    const ticket = await Ticket.findByEvent(data)
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.set({title, price})

    await ticket.save()

    msg.ack();
  }
}