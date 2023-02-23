import express, {Request, Response} from "express"
import jwt from "jsonwebtoken"
import User from "../models/user";
import {body} from "express-validator"
import {BadRequestError, validateRequest} from "@rokufsdev/common"

const {Router} = express
const router = Router()

const validatorOptions = [
  body('email')
  .isEmail()
  .withMessage('Email must be valid'),
  body('password')
  .trim()
  .isLength({
    min: 4,
    max: 20
  })
  .withMessage("Password must be between 4 and 20 characters")
]

router.post("/signup", validatorOptions, validateRequest, async (req: Request<{}, {}, { email: string, password: string }>, res: Response) => {
  const {email, password} = req.body;
  const existingUser = await User.findOne({email})

  if (existingUser) {
    throw new BadRequestError('Email in use', 'email')
  }

  const user = User.build({email, password})
  await user.save()

  // Generate JWT
  const userJwt = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_KEY!) // The check is done on index.ts start function

  // Store it on session object
  req.session = {
    jwt: userJwt
  }

  res.status(201).json(user)
})

export {router as signupRouter}