import { dbQuery, dbExec } from "@/app/lib/db.server";
import { UserAkun, VendorData } from "../types";

export const manajemenService = {
  // --- BAGIAN USER / ADMIN ---
  async getUsers() {
    return await dbQuery<UserAkun>(`SELECT userId, username, email, namaUser, roleUser FROM users ORDER BY roleUser DESC, namaUser ASC`);
  },
  async createUser(data: UserAkun) {
    const existing = await dbQuery<any>(`SELECT userId FROM users WHERE userId = ? OR username = ?`, [data.userId, data.username]);
    if (existing.length > 0) throw new Error("ID atau Username sudah terdaftar!");

    await dbExec(
      `INSERT INTO users (userId, username, password, email, namaUser, roleUser) VALUES (?, ?, ?, ?, ?, ?)`,
      [data.userId, data.username, data.password, data.email || null, data.namaUser, data.roleUser]
    );
  },
  async updateUser(userId: string, data: Partial<UserAkun>) {
    if (data.password) {
      await dbExec(`UPDATE users SET username = ?, email = ?, namaUser = ?, roleUser = ?, password = ? WHERE userId = ?`, 
        [data.username, data.email || null, data.namaUser, data.roleUser, data.password, userId]);
    } else {
      await dbExec(`UPDATE users SET username = ?, email = ?, namaUser = ?, roleUser = ? WHERE userId = ?`, 
        [data.username, data.email || null, data.namaUser, data.roleUser, userId]);
    }
  },
  async deleteUser(userId: string) {
    await dbExec(`DELETE FROM users WHERE userId = ?`, [userId]);
  },

  // --- BAGIAN VENDOR ---
  async getVendors() {
    return await dbQuery<VendorData>(`SELECT * FROM vendor ORDER BY namaVendor ASC`);
  },
  async createVendor(data: VendorData) {
    const existing = await dbQuery<any>(`SELECT kodeVendor FROM vendor WHERE kodeVendor = ?`, [data.kodeVendor]);
    if (existing.length > 0) throw new Error("Kode Vendor sudah terdaftar!");

    await dbExec(
      `INSERT INTO vendor (kodeVendor, namaVendor, alamat, userId) VALUES (?, ?, ?, ?)`,
      [data.kodeVendor, data.namaVendor, data.alamat || null, data.userId || null]
    );
  },
  async updateVendor(kodeVendor: string, data: Partial<VendorData>) {
    await dbExec(`UPDATE vendor SET namaVendor = ?, alamat = ?, userId = ? WHERE kodeVendor = ?`, 
      [data.namaVendor, data.alamat || null, data.userId || null, kodeVendor]);
  },
  async deleteVendor(kodeVendor: string) {
    await dbExec(`DELETE FROM vendor WHERE kodeVendor = ?`, [kodeVendor]);
  }
};