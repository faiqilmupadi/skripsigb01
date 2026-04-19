import { dbQuery } from "@/app/lib/db.server";
import { MovementData } from "../types";

export async function getRiwayatTransaksi(start: string, end: string): Promise<MovementData[]> {
  return await dbQuery<MovementData>(`
    SELECT 
      m.*, 
      u.namaUser 
    FROM movements m
    LEFT JOIN users u ON m.userName = u.userId
    WHERE m.postingDate BETWEEN ? AND ?
    ORDER BY m.postingDate DESC, m.movementId DESC
  `, [start, end]);
}