import {Publisher, Channels, TicketCreatedEvent} from "@rokufsdev/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Channels.TICKET_CREATED
}