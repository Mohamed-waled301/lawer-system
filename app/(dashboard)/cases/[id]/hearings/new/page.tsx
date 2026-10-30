import { notFound } from "next/navigation";
import { getCaseDetails } from "@/actions/cases";
import { NewHearingForm } from "./NewHearingForm";

export const dynamic = "force-dynamic";

export default async function NewHearingPage({
  params,
}: {
  params: { id: string };
}) {
  const caseItem = await getCaseDetails(params.id);

  if (!caseItem) {
    notFound();
  }

  return <NewHearingForm caseItem={caseItem} />;
}

