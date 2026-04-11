// C:\Faiq\skripsi\skripsiku\app\features\stokBarang\types.ts
export type StockRow = {
  partNumber: string;
  plant: string;
  materialDescription: string;
  freeStock: number;
  blockedStock: number;
  reorderPoint: number;
};

export type LowStockRow = StockRow;

export type RestockNeedQCRow = {
  requestId: number;
  partNumber: string;
  plant: string;
  postingDate: string;
  purchaseOrder: string;
  requestedQty: number;
};

export type TakePayload = {
  partNumber: string;
  plant: string;
  quantity: number;
};

export type ReturnPayload = {
  partNumber: string;
  plant: string;
  quantity: number;
};

export type RestockRequestPayload = {
  partNumber: string;
  plant: string;
  quantity: number;
};

export type RestockReceivePayload = {
  requestId: number;
  freeIn: number;
  blockedIn: number;
};
