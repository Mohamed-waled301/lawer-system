import { getCases } from "@/actions/cases";
import { getAllClientsForSelect } from "@/actions/clients";
import { getTreasuries } from "@/actions/treasury";
import { NewPaymentForm } from "./NewPaymentForm";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: { caseId?: string; clientId?: string };
}) {
  const [casesData, clients, treasuries] = await Promise.all([
    getCases({ isClosed: false, limit: 150 }),
    getAllClientsForSelect(),
    getTreasuries(),
  ]);

  return (
    <NewPaymentForm
      cases={casesData.cases as any}
      clients={clients}
      treasuries={treasuries}
      preselectedCaseId={searchParams.caseId}
      preselectedClientId={searchParams.clientId}
    />
  );
}

