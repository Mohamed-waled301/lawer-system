import { getSettingsMap, getCategories, getStatuses } from "@/actions/settings";
import { getCurrentUser } from "@/lib/auth";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, categories, statuses, user] = await Promise.all([
    getSettingsMap(),
    getCategories(),
    getStatuses(),
    getCurrentUser(),
  ]);

  return (
    <SettingsClient
      settings={settings}
      categories={categories as any}
      statuses={statuses as any}
      userRole={user?.role}
    />
  );
}

