import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

declare global {
  var signin: (id?: string) => string[];
}

let mongo: MongoMemoryServer

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = "sk_test_51MdEOcKV7I06EemdymYvzbdFkyz8Had9ggYLxi032hJQmcHpeBPdjvqss2pKbaqk3LnocFvC026jFRNNePCaLhVg00N0DKu1rJ"

beforeAll(async () => {
  process.env.JWT_KEY = "test"
  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()

  mongoose.set({
    strictQuery: false
  })

  await mongoose.connect(mongoUri, {})
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  if (mongo) {
    await mongo.stop()
  }
  await mongoose.connection.close()
})

global.signin = (id?: string) => {
  // Build a JWT payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session object
  const session = {jwt: token}

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return a string that's the cookie with the encoded data
  return [`session=${base64}`];
}