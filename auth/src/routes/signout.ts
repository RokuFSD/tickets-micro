import express from "express"

const {Router} = express
const router = Router()

router.post("/signout", (req, res) => {
  req.session = null
  res.send({});
})

export {router as signoutRouter}