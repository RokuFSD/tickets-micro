import {Publisher, Channels, PaymentCreated} from "@rokufsdev/common"

export class PaymentCreatedPublisher extends Publisher<PaymentCreated> {
  readonly subject = Channels.PAYMENT_CREATED
}