import { NewCaseForm } from "./NewCaseForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: {
    clientId?: string;
  };
}

export default function NewCasePage({ searchParams }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewCaseForm initialClientId={searchParams?.clientId} />
    </div>
  );
}
