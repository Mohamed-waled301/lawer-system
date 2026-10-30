import { getConsultations } from "@/actions/consultations";
import { getCurrentUser } from "@/lib/auth";
import { ConsultationsClient } from "@/components/consultations/ConsultationsClient";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const [data, user] = await Promise.all([
    getConsultations({ limit: 100 }),
    getCurrentUser(),
  ]);

  return (
    <ConsultationsClient
      initialConsultations={data.consultations as any}
      userRole={user?.role}
    />
  );
}
