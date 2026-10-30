import { ClientDocumentsUploadClient } from "./ClientDocumentsUploadClient";

export const dynamic = "force-dynamic";

export default function NewClientDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  return <ClientDocumentsUploadClient clientId={params.id} />;
}
