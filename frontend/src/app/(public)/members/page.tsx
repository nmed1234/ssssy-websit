import { serverGetMemberProfiles } from "@/lib/server-api";
import MembersPageClient from "./MembersPageClient";

export const revalidate = 120;

export const metadata = {
  title: "Members Directory | SSSS",
  description: "Browse the members directory of the Soil Science Society of Syria.",
};

export default async function MembersPage() {
  const initial = await serverGetMemberProfiles<any>(0, 24, 120);
  return (
    <MembersPageClient
      initialMembers={initial?.content ?? []}
      initialTotalPages={initial?.totalPages ?? 0}
    />
  );
}
