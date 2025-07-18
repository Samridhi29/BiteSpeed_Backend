import { Router } from "express";
import { identifyUser } from "../controllers/identify.controller";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.post("/", validateRequest, identifyUser);

export default router;
