import express from "express";
import "express-async-errors"
import usersRouter from "./routes";
import cookieSession from "cookie-session"
import {errorHandler, NotFoundError} from "@rokufsdev/common";

const app = express();
app.set('trust proxy', true)
app.use(express.json(), express.urlencoded({extended: true}))
app.use(cookieSession({
  signed: false,
  secure: false,
}))

app.use(usersRouter())

app.all('*', async () => {
  throw new NotFoundError()
})

app.use(errorHandler)

export default app