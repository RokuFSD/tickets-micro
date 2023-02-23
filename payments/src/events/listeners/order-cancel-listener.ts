import {Listener, QGroups, Channels, OrderCancelledEvent, OrderStatus} from "@rokufsdev/common";
import {Message} from "node-nats-streaming";
import Order from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  readonly subject = Channels.ORDER_CANCELLED
  readonly queueGroupName = QGroups.PAYMENTS_SERVICE

  async onMessage(data: OrderCancelledEvent["data"], message: Message){
    const orderToCancel = await Order.findOne({
      _id: data.id,
      version: data.version! - 1
    })

    if(!orderToCancel){
      throw new Error("Order not found")
    }
    orderToCancel.set({status: OrderStatus.CANCEL})
    await orderToCancel.save()

    message.ack()
  }
}