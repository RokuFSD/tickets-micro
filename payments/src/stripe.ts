import Stripe from "stripe"

if(!process.env.STRIPE_KEY){
  throw new Error("There is no key for stripeTs service")
}

export const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: '2022-11-15'
})