import express, {Response, Request} from "express"
import User from "../models/user";
import jwt from "jsonwebtoken";
import {body} from "express-validator"
import {Password} from "../services/password";
import {validateRequest, BadRequestError} from "@rokufsdev/common"

const {Router} = express
const router = Router()

const validatorOptions = [
  body('email')
  .isEmail()
  .withMessage('Email must be valid'),
  body('password')
  .trim()
  .notEmpty()
  .withMessage('You must supply a password')
]

router.post("/signin", validatorOptions, validateRequest, async (req: Request, res: Response) => {
  const {email, password} = req.body

  const existingUser = await User.findOne({email})
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials')
  }
  const passwordsMatch = await Password.compare(existingUser.password, password)
  if (!passwordsMatch) {
    throw new BadRequestError("Invalid credentials");
  }

  // Generate JWT
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY!) // The check is done on index.ts start function

  // Store it on session object
  req.session = {
    jwt: userJwt
  }

  res.status(200).json(existingUser)
})

export {router as signinRouter}