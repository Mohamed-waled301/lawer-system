import { getStaffList } from "@/actions/staff";
import { getCurrentUser } from "@/lib/auth";
import { StaffClient } from "@/components/staff/StaffClient";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [staff, user] = await Promise.all([
    getStaffList(),
    getCurrentUser(),
  ]);

  return <StaffClient initialStaff={staff as any} userRole={user?.role} />;
}

