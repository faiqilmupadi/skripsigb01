"use client";

import { useDashboardAnalisis } from "@/app/features/dashboardAnalisis/hooks/useDashboardAnalisis";
import TimeRangeFilter from "@/app/components/shared/TimeRangeFilter";

import AdminActivityCard from "./AdminActivityCard";
import TopBarangCard from "./TopBarangCard";
import RopAlertCard from "./RopAlertCard";
import PoMonitorCard from "./PoMonitorCard";
import LossDamageCard from "./LossDamageCard";

export default function DashboardAnalisisPage() {
  const d = useDashboardAnalisis();

  if (d.loading && !d.data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "sans-serif" }}>
        <div style={{ display: "inline-block", width: "30px", height: "30px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "16px" }}>Menyiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", width: "100%", boxSizing: "border-box", fontFamily: "sans-serif" }}>
      
      {/* HEADER & FILTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Financial & Operational</h1>
          <p style={{ margin: "8px 0 0 0", fontSize: "15px", color: "#64748b" }}>
            Ikhtisar pergerakan barang dan performa gudang.
          </p>
        </div>
        
        <TimeRangeFilter 
          preset={d.preset} setPreset={d.setPreset}
          customStart={d.customStart} setCustomStart={d.setCustomStart}
          customEnd={d.customEnd} setCustomEnd={d.setCustomEnd}
        />
      </div>

      {/* GRID LAYOUT 12 KOLOM (FULL SCREEN) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(12, 1fr)", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* Baris Atas: 4 - 4 - 4 */}
        <div style={{ gridColumn: "span 4" }}>
          <AdminActivityCard activities={d.data?.adminActivities || []} />
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <TopBarangCard topBarang={d.data?.top3Barang || []} />
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <RopAlertCard alerts={d.data?.ropAlerts || []} />
        </div>

        {/* Baris Bawah: 6 - 6 */}
        <div style={{ gridColumn: "span 6" }}>
          <PoMonitorCard 
            poData={d.poMonitor} 
            selectedStatus={d.selectedStatus} 
            setSelectedStatus={d.setSelectedStatus} 
          />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <LossDamageCard lossDamage={d.data?.lossDamage || []} />
        </div>

      </div>
    </div>
  );
}