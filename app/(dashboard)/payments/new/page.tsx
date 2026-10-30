import { NewPaymentForm } from "./NewPaymentForm";

export const dynamic = "force-dynamic";

export default function NewPaymentPage({
  searchParams,
}: {
  searchParams: { caseId?: string; clientId?: string };
}) {
  return (
    <NewPaymentForm
      preselectedCaseId={searchParams.caseId}
      preselectedClientId={searchParams.clientId}
    />
  );
}
