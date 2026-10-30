import { CaseDocumentsUploadClient } from "./CaseDocumentsUploadClient";

export const dynamic = "force-dynamic";

export default function NewCaseDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  return <CaseDocumentsUploadClient caseId={params.id} />;
}
