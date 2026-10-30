import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getCaseDetails } from "@/actions/cases";
import { CaseDocumentsUploadClient } from "./CaseDocumentsUploadClient";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function NewCaseDocumentPage({ params }: Props) {
  await requireAuth();

  const caseItem = await getCaseDetails(params.id);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CaseDocumentsUploadClient caseItem={caseItem} />
    </div>
  );
}

