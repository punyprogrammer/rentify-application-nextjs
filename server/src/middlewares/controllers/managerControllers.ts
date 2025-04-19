import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });
    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({
        message: "Tenant not found",
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error receiving tenant:${error.message}` });
  }
};
export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;
    const tenant = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });
    res.status(200).json(tenant);
  } catch (error: any) {
    res.status(500).json({
      message: `Error in creating tenant:${error.message}`,
    });
  }
};
