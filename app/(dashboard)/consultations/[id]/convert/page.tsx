import { ConvertConsultationForm } from "./ConvertConsultationForm";

export const dynamic = "force-dynamic";

export default function ConvertConsultationPage({
  params,
}: {
  params: { id: string };
}) {
  return <ConvertConsultationForm consultationId={params.id} />;
}
