import express from "express"
import {currentUser} from "@rokufsdev/common"

const {Router} = express
const router = Router()

router.get("/currentuser", currentUser, (req, res) => {
  res.send({currentUser: req.currentUser || null})
})

export {router as currentUserRouter}