import { Request, Response } from "express";
import { reconcileContact } from "../services/identify.service";

export async function identifyUser(req: Request, res: Response) {
  try {
    const { email, phoneNumber } = req.body;
    const contact = await reconcileContact(email, phoneNumber);
    return res.status(200).json({ contact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

