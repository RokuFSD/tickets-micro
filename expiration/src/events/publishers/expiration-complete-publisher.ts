import {Publisher, ExpirationCompleteEvent, Channels} from "@rokufsdev/common"

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Channels.EXPIRATION_COMPLETE
}