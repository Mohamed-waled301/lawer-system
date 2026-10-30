import { getClients } from "@/actions/clients";
import { getCurrentUser } from "@/lib/auth";
import { ClientsClient } from "@/components/clients/ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [data, user] = await Promise.all([
    getClients({ limit: 100 }),
    getCurrentUser(),
  ]);

  return (
    <ClientsClient
      initialClients={data.clients as any}
      totalPages={data.totalPages}
      currentPage={data.page}
      userRole={user?.role}
    />
  );
}

