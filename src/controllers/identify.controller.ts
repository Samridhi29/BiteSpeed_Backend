import { Request, Response } from 'express';
import { handleIdentityReconciliation } from '../services/identify.service';

export const identifyUser = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    const result = await handleIdentityReconciliation(email, phoneNumber);
    return res.json({ contact: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
