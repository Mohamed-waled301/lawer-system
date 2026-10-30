import { notFound } from "next/navigation";
import { getClientDetails } from "@/actions/clients";
import { ClientEditForm } from "./ClientEditForm";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getClientDetails(params.id);

  if (!client) {
    notFound();
  }

  return <ClientEditForm client={client} />;
}

