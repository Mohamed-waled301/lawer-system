import { CaseEditForm } from "./CaseEditForm";

export const dynamic = "force-dynamic";

export default function EditCasePage({
  params,
}: {
  params: { id: string };
}) {
  return <CaseEditForm caseId={params.id} />;
}
