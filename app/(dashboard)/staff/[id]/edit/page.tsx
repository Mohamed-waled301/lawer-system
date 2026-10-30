import { StaffEditForm } from "./StaffEditForm";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default function EditStaffPage({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StaffEditForm staffId={params.id} />
    </div>
  );
}
