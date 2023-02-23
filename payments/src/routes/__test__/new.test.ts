import app from "../../app";
import Order from "../../models/order";
import Payment from "../../models/payment";
import request from "supertest"
import mongoose from "mongoose";

import {stripe} from "../../stripe";
import {OrderStatus} from "@rokufsdev/common";

// jest.mock("../../stripeTs");

describe("New charge route", () => {
  it("returns a 404 when the user pays for a order that doesn't exist", async () => {
    await request(app)
    .post("/api/payments")
    .set('Cookie', signin())
    .send({
      token: 'nope',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
  })

  it("returns a 401 when the user pays for a order that doesn't belong to the user", async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      price: 200,
      status: OrderStatus.COMPLETE,
      version: 0
    })
    await order.save()

    await request(app)
    .post("/api/payments")
    .set('Cookie', signin())
    .send({
      token: 'nope',
      orderId: order.id
    })
    .expect(401)
  })

  it("returns a 400 when the user pays for a order that had been cancelled", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const user = signin(userId)
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: userId,
      price: 200,
      status: OrderStatus.CANCEL,
      version: 0
    })
    await order.save()

    await request(app)
    .post("/api/payments")
    .set('Cookie', user)
    .send({
      token: 'nope',
      orderId: order.id
    })
    .expect(400)
  })

  it("returns a 201 with valid inputs", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
      price,
      userId,
      version: 0,
      status: OrderStatus.CREATED,
      id: new mongoose.Types.ObjectId().toHexString(),
    })
    await order.save()

    await request(app)
    .post("/api/payments")
    .set('Cookie', signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

    const stripeCharges = await stripe.charges.list({limit: 50});
    const stripeCharge = stripeCharges.data.find(charge => {
      return charge.amount === price * 100
    })

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge!.id
    })

    expect(stripeCharge).toBeDefined()
    expect(payment).not.toBe(null)

    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    // expect(stripe.charges.create).toHaveBeenCalled()
    // expect(chargeOptions.source).toBe('tok_visa')
    // expect(chargeOptions.currency).toBe('usd')
    // expect(chargeOptions.amount).toBe(order.price * 100)
  })
})