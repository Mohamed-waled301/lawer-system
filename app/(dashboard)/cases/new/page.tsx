import { getAllClientsForSelect } from "@/actions/clients";
import { getCategories, getStatuses } from "@/actions/settings";
import { getLawyersList } from "@/actions/staff";
import { NewCaseForm } from "./NewCaseForm";

export const dynamic = "force-dynamic";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const [clients, categories, statuses, lawyers] = await Promise.all([
    getAllClientsForSelect(),
    getCategories(),
    getStatuses(),
    getLawyersList(),
  ]);

  return (
    <NewCaseForm
      clients={clients}
      categories={categories}
      statuses={statuses}
      lawyers={lawyers}
      preselectedClientId={searchParams.clientId}
    />
  );
}

