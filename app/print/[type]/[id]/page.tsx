import { PrintClientView } from "@/components/print/PrintClientView";

export const dynamic = "force-dynamic";

export default function PrintPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  return <PrintClientView type={params.type} id={params.id} />;
}
