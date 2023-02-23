import {Message} from "node-nats-streaming";
import {Channels, Listener, QGroups, TicketCreatedEvent} from "@rokufsdev/common"
import Ticket from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Channels.TICKET_CREATED;
  readonly queueGroupName = QGroups.ORDERS_SERVICE;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const {id, title, price} = data
    const ticket = Ticket.build({id, title, price})
    await ticket.save()

    msg.ack();
  }

}