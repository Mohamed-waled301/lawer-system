import { notFound } from "next/navigation";
import { getCaseDetails } from "@/actions/cases";
import { getStatuses } from "@/actions/settings";
import { getCurrentUser } from "@/lib/auth";
import { CaseDetailsClient } from "@/components/cases/CaseDetailsClient";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [caseItem, statuses, user] = await Promise.all([
    getCaseDetails(params.id),
    getStatuses(),
    getCurrentUser(),
  ]);

  if (!caseItem) {
    notFound();
  }

  return (
    <CaseDetailsClient
      caseItem={caseItem}
      statuses={statuses}
      userRole={user?.role}
      userName={user?.name}
    />
  );
}

