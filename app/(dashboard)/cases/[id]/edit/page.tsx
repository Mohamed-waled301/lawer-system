import { notFound } from "next/navigation";
import { getCaseDetails } from "@/actions/cases";
import { getCategories, getStatuses } from "@/actions/settings";
import { getLawyersList } from "@/actions/staff";
import { CaseEditForm } from "./CaseEditForm";

export const dynamic = "force-dynamic";

export default async function EditCasePage({
  params,
}: {
  params: { id: string };
}) {
  const [caseItem, categories, statuses, lawyers] = await Promise.all([
    getCaseDetails(params.id),
    getCategories(),
    getStatuses(),
    getLawyersList(),
  ]);

  if (!caseItem) {
    notFound();
  }

  return (
    <CaseEditForm
      caseItem={caseItem}
      categories={categories}
      statuses={statuses}
      lawyers={lawyers}
    />
  );
}

