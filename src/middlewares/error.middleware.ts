import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);

  // If the error has a status code, use it; otherwise default to 500
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ error: message });
}
