import express from "express";
import "express-async-errors"
import cookieSession from "cookie-session"
import {errorHandler, NotFoundError, currentUser} from "@rokufsdev/common";
import ticketRouter from "./routes";

const app = express();
app.set('trust proxy', true)
app.use(express.json(), express.urlencoded({extended: true}))
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}))

app.use(currentUser);
app.use(ticketRouter())

app.all('*', async () => {
  throw new NotFoundError()
})

app.use(errorHandler)

export default app