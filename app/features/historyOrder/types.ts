// app/features/historyOrder/types.ts
import { z } from "zod";

export type HistoryOrderRow = {
  movementId: number;
  partNumber: string;
  plant: string;
  materialDescription: string;
  purchaseOrder: string | null;
  orderNo: string | null;
  movementType: string;
  quantity: number;
  userName: string;
  postingDate: string;
};

export const HistoryOrderQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});
