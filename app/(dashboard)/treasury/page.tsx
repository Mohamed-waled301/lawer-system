import { redirect } from "next/navigation";
import { getTreasuries } from "@/actions/treasury";
import { getCurrentUser } from "@/lib/auth";
import { TreasuryClient } from "@/components/treasury/TreasuryClient";

export const dynamic = "force-dynamic";

export default async function TreasuryPage() {
  const user = await getCurrentUser();

  // Financial page: Admin only
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const treasuries = await getTreasuries();

  return (
    <TreasuryClient
      treasuries={treasuries as any}
      userRole={user.role}
    />
  );
}

