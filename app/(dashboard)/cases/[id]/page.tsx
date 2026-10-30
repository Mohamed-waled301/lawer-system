import { CaseDetailsClient } from "@/components/cases/CaseDetailsClient";

export const dynamic = "force-dynamic";

export default function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <CaseDetailsClient caseId={params.id} />;
}
