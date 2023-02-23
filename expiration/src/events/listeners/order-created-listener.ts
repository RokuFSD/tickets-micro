import {Listener, OrderCreatedEvent, Channels, QGroups} from "@rokufsdev/common"
import {Message} from "node-nats-streaming";
import expirationQueue from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Channels.ORDER_CREATED
  readonly queueGroupName = QGroups.EXPIRATION_SERVICE

  async onMessage(data: OrderCreatedEvent["data"], message: Message) {
    const delay = new Date(data.expiresAt!).getTime() - new Date().getTime()
    console.log('Waiting this many milliseconds to process the job', delay)

    await expirationQueue.add({
      orderId: data.id!
    }, {
      delay
    });

    message.ack()
  }

}