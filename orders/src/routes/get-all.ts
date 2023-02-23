import {Router, Request, Response, NextFunction} from "express"
import {requireAuth} from "@rokufsdev/common";
import Order from "../models/order";

const router = Router()

router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({
      userId: req.currentUser!.id
    }).populate("ticket")

    res.send(orders)
  } catch (e){
    console.error(e)
    return next(e)
  }
})

export default router