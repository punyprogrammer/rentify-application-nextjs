import express from "express";
import {
  createTenant,
  getTenant,
} from "../middlewares/controllers/tenantControllers";

const router = express.Router();
router.get("/:cognitoId", getTenant);
router.post("/", createTenant);
export default router;
