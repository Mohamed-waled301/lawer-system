import { requireAuth } from "@/lib/auth";
import { NewClientForm } from "./NewClientForm";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  await requireAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewClientForm />
    </div>
  );
}
