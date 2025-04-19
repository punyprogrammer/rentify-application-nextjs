import express from "express";
import {
  createTenant,
  getTenant,
  updateTenant,
} from "../middlewares/controllers/tenantControllers";

const router = express.Router();
router.get("/:cognitoId", getTenant);
router.post("/", createTenant);
router.patch("/:cognitoId", updateTenant);
export default router;
