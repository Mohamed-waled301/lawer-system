import { CaseStatusChangeForm } from "./CaseStatusChangeForm";

export const dynamic = "force-dynamic";

export default function CaseStatusPage({ params }: { params: { id: string } }) {
  return <CaseStatusChangeForm caseId={params.id} />;
}
