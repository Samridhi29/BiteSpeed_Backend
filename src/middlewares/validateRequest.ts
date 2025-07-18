import { Request, Response, NextFunction } from "express";

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "At least one of email or phoneNumber is required." });
  }
  next();
}
