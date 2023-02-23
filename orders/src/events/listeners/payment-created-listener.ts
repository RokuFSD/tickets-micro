import {Message} from "node-nats-streaming";
import {Channels, Listener, QGroups, PaymentCreated, OrderStatus} from "@rokufsdev/common"
import Order from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreated> {
  readonly subject = Channels.PAYMENT_CREATED
  readonly queueGroupName = QGroups.ORDERS_SERVICE

  async onMessage(data: PaymentCreated["data"], message: Message) {
    const {orderId} = data

    const order = await Order.findById(orderId)
    if(!order){
      throw new Error("Order not found");
    }

    order.set({status: OrderStatus.COMPLETE})
    await order.save()

    message.ack()
  }
}