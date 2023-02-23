import {Listener, QGroups, Channels, OrderCreatedEvent} from "@rokufsdev/common"
import {Message} from "node-nats-streaming";
import Order from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly subject = Channels.ORDER_CREATED
  readonly queueGroupName = QGroups.PAYMENTS_SERVICE

  async onMessage(data: OrderCreatedEvent["data"], message: Message){
    const order = Order.build({
      id: data.id!,
      price: data.ticket!.price!,
      status: data.status!,
      userId: data.userId!,
      version: data.version!
    })

    await order.save()

    message.ack()
  }
}
