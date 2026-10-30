import { notFound } from "next/navigation";
import { getClientDetails } from "@/actions/clients";
import { getCategories, getStatuses } from "@/actions/settings";
import { getLawyersList } from "@/actions/staff";
import { getCurrentUser } from "@/lib/auth";
import { ClientDetailsClient } from "@/components/clients/ClientDetailsClient";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [client, categories, statuses, lawyers, user] = await Promise.all([
    getClientDetails(params.id),
    getCategories(),
    getStatuses(),
    getLawyersList(),
    getCurrentUser(),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <ClientDetailsClient
      client={client}
      categories={categories}
      statuses={statuses}
      lawyers={lawyers}
      userRole={user?.role}
    />
  );
}

