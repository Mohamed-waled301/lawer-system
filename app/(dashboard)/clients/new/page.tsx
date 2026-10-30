import { NewClientForm } from "./NewClientForm";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewClientForm />
    </div>
  );
}
