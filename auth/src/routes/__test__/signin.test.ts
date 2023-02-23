import request from "supertest"
import app from "../../app";

describe("Signin route", () => {
  it("returns a 200 on successful signin", async () => {
    await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201)
    const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(200)
    expect(response.get('Set-Cookie')).toBeDefined()
  })

  it("returns a 400 when a invalid email is provided", async () => {
    return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(400)
    .expect((res) => res.body.errors[0].field === "email")
  })

  it("returns a 400 when an invalid password is provided", async () => {
    await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201)
    return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "psword"
    })
    .expect(400)
    .expect((res) => res.body.errors[0].field === "password")
  })
})