import { redirect } from "next/navigation";
import { getPayments } from "@/actions/payments";
import { getCurrentUser } from "@/lib/auth";
import { PaymentsClient } from "@/components/payments/PaymentsClient";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await getCurrentUser();

  // Server-side permission check: Only admin can view financial payment reports
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const data = await getPayments({ limit: 150 });

  return (
    <PaymentsClient
      initialPayments={data.payments as any}
      userRole={user.role}
    />
  );
}

