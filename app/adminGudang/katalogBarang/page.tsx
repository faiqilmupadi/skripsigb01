import KatalogBarangClient from "@/app/features/katalogBarang/components/KatalogBarangClient";
import { katalogBarangService } from "@/app/features/katalogBarang/services/katalogBarangService";

export default async function Page() {
  const colorOptions = await katalogBarangService.getColors();

  return <KatalogBarangClient colorOptions={colorOptions} />;
}