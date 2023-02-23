import request from "supertest";
import app from "../../app";

describe("Current User endpoint", () => {
  it("responds with details about the current user", async () => {
    const cookie = await signin();

    const response = await request(app)
    .get("/api/users/currentuser")
    .set('Cookie', cookie)
    .send()
    .expect(200)
    expect(response.body.currentUser).not.toBe(null)
  })

  it("responds with null if not authenticated", async () => {
    const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200)
    expect(response.body.currentUser).toBe(null)
  })
})