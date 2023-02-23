import {Publisher, Channels, OrderCreatedEvent} from "@rokufsdev/common"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Channels.ORDER_CREATED
}