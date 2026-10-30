import { NewStaffForm } from "./NewStaffForm";

export const dynamic = "force-dynamic";

export default function NewStaffPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewStaffForm />
    </div>
  );
}
