import { NewHearingForm } from "./NewHearingForm";

export const dynamic = "force-dynamic";

export default function NewHearingPage({
  params,
}: {
  params: { id: string };
}) {
  return <NewHearingForm caseId={params.id} />;
}
