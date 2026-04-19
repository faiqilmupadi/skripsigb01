import { TabType } from "../types";

export const manajemenClient = {
  async fetchList(type: TabType) {
    const res = await fetch(`/api/ownerGudang/manajemenAkun?type=${type}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  },
  async create(type: TabType, data: any) {
    const res = await fetch(`/api/ownerGudang/manajemenAkun?type=${type}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
  },
  async update(type: TabType, id: string, data: any) {
    const res = await fetch(`/api/ownerGudang/manajemenAkun/${id}?type=${type}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
  },
  async remove(type: TabType, id: string) {
    const res = await fetch(`/api/ownerGudang/manajemenAkun/${id}?type=${type}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
  }
};