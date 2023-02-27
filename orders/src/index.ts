import "express-async-errors"
import mongoose from "mongoose";
import app from "./app";
import {DatabaseConnectionError} from "@rokufsdev/common"
import {natsWrapper} from "./nats-wrapper";
import {TicketCreatedListener} from "./events/listeners/ticket-created-listener";
import {TicketUpdatedListener} from "./events/listeners/ticket-updated-listener"
import {ExpirationCompleteListener} from "./events/listeners/expiration-complete-listener";
import {PaymentCreatedListener} from "./events/listeners/payment-created-listener";

async function start() {
  console.log('Starting...')
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined")
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined")
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined")
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined")
  }
  try {
    mongoose.set({
      strictQuery: false
    })
    await mongoose.connect(process.env.MONGO_URI)
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!")
      process.exit();
    })

    process.on("SIGINT", () => natsWrapper.client.close())
    process.on("SIGTERM", () => natsWrapper.client.close())

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();

  } catch (e) {
    throw new DatabaseConnectionError()
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000 --- Orders Service");
  });
}

void start();