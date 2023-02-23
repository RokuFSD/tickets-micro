import {Publisher, Channels, TicketUpdatedEvent} from "@rokufsdev/common"

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Channels.TICKET_UPDATED
}