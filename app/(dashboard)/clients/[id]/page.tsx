import { ClientDetailsClient } from "@/components/clients/ClientDetailsClient";

export const dynamic = "force-dynamic";

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ClientDetailsClient clientId={params.id} />;
}
