import {Publisher, Channels, OrderCancelledEvent} from "@rokufsdev/common"

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject = Channels.ORDER_CANCELLED
}