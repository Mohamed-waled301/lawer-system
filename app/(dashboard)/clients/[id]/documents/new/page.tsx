import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getClientDetails } from "@/actions/clients";
import { ClientDocumentsUploadClient } from "./ClientDocumentsUploadClient";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function NewClientDocumentPage({ params }: Props) {
  await requireAuth();

  const client = await getClientDetails(params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ClientDocumentsUploadClient client={client} />
    </div>
  );
}

