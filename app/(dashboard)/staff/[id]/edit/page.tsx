import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getStaffMember } from "@/actions/staff";
import { StaffEditForm } from "./StaffEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditStaffPage({ params }: Props) {
  await requireAuth();

  const staff = await getStaffMember(params.id);

  if (!staff) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StaffEditForm staff={staff} />
    </div>
  );
}

