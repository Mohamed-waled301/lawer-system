import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategories, getStatuses } from "@/actions/settings";
import { ConvertConsultationForm } from "./ConvertConsultationForm";

export const dynamic = "force-dynamic";

export default async function ConvertConsultationPage({
  params,
}: {
  params: { id: string };
}) {
  const [consultation, categories, statuses] = await Promise.all([
    prisma.consultation.findUnique({
      where: { id: params.id },
      include: { lawyer: true, client: true },
    }),
    getCategories(),
    getStatuses(),
  ]);

  if (!consultation) {
    notFound();
  }

  return (
    <ConvertConsultationForm
      consultation={consultation as any}
      categories={categories}
      statuses={statuses}
    />
  );
}

