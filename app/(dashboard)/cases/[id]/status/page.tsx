import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getCaseDetails } from "@/actions/cases";
import { getStatuses } from "@/actions/settings";
import { CaseStatusChangeForm } from "./CaseStatusChangeForm";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function CaseStatusPage({ params }: Props) {
  await requireAuth();

  const [caseItem, statuses] = await Promise.all([
    getCaseDetails(params.id),
    getStatuses(),
  ]);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CaseStatusChangeForm caseItem={caseItem} statuses={statuses} />
    </div>
  );
}

