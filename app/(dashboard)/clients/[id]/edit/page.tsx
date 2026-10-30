import { ClientEditForm } from "./ClientEditForm";

export const dynamic = "force-dynamic";

export default function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  return <ClientEditForm clientId={params.id} />;
}
