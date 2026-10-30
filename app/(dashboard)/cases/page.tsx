import { getCases } from "@/actions/cases";
import { getAllClientsForSelect } from "@/actions/clients";
import { getCategories, getStatuses } from "@/actions/settings";
import { getLawyersList } from "@/actions/staff";
import { getCurrentUser } from "@/lib/auth";
import { CasesClient } from "@/components/cases/CasesClient";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const [data, clients, categories, statuses, lawyers, user] = await Promise.all([
    getCases({ limit: 100 }),
    getAllClientsForSelect(),
    getCategories(),
    getStatuses(),
    getLawyersList(),
    getCurrentUser(),
  ]);

  return (
    <CasesClient
      initialCases={data.cases as any}
      clientsList={clients as any}
      categoriesList={categories as any}
      statusesList={statuses as any}
      lawyersList={lawyers as any}
      userRole={user?.role}
    />
  );
}

