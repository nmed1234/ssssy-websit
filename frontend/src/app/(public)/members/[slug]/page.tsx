import { serverGetMemberBySlug, serverGetMemberProfiles } from "@/lib/server-api";
import MemberDetailClient from "./MemberDetailClient";

interface MemberBasic { id: string; slug?: string; }

export const revalidate = 300;

export async function generateStaticParams() {
  const result = await serverGetMemberProfiles<MemberBasic>(0, 20, 3600);
  if (!result?.content) return [];
  return result.content
    .filter((m) => m.slug)
    .map((m) => ({ slug: m.slug as string }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: "Member Profile | SSSS",
    description: "Member profile page on the Soil Science Society of Syria website.",
  };
}

export default async function MemberDetailPage({ params }: { params: { slug: string } }) {
  const member = await serverGetMemberBySlug(params.slug, 300);
  return <MemberDetailClient initialMember={member} />;
}
