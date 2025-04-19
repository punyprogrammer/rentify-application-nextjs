import express from "express";
import {
  createManager,
  getManager,
  updateManager,
} from "../middlewares/controllers/managerControllers";

const router = express.Router();
router.get("/:cognitoId", getManager);
router.put("/:cognitoId",updateManager)
router.post("/", createManager);
export default router;
