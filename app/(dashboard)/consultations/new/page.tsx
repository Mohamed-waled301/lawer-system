import { getLawyersList } from "@/actions/staff";
import { getAllClientsForSelect } from "@/actions/clients";
import { getTreasuries } from "@/actions/treasury";
import { NewConsultationForm } from "./NewConsultationForm";

export const dynamic = "force-dynamic";

export default async function NewConsultationPage() {
  const [lawyers, clients, treasuries] = await Promise.all([
    getLawyersList(),
    getAllClientsForSelect(),
    getTreasuries(),
  ]);

  return (
    <NewConsultationForm
      lawyers={lawyers}
      clients={clients}
      treasuries={treasuries}
    />
  );
}

