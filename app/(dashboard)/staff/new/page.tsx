import { requireAuth } from "@/lib/auth";
import { NewStaffForm } from "./NewStaffForm";

export const dynamic = "force-dynamic";

export default async function NewStaffPage() {
  await requireAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewStaffForm />
    </div>
  );
}

