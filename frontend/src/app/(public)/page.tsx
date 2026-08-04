import {
  serverGetSiteSections,
  serverGetPublishedContent,
  serverGetUpcomingEvents,
  serverGetBoardMembers,
  serverGetMemberProfiles,
} from "@/lib/server-api";
import type { BoardMember, ContentItem, Event, SiteSection } from "@/types";
import HomepageClient from "./HomepageClient";

export const revalidate = 60;

export const metadata = {
  title: "Home | Soil Science Society of Syria",
  description: "The Soil Science Society of Syria — advancing soil science research, education, and sustainable land management.",
};

// Minimal member shape needed by TestimonialsSection
export interface MemberProfile {
  id: string;
  userId?: string;
  nameAr?: string;
  nameEn?: string;
  firstName?: string;
  lastName?: string;
  titleAr?: string;
  position?: string;
  institution?: string;
  photoUrl?: string;
  photo?: string;
  membershipType?: string;
  slug?: string;
}

export default async function HomePage() {
  // Parallel fetch all homepage data on the server
  const [sections, newsResult, eventsResult, boardMembers, membersResult] = await Promise.all([
    serverGetSiteSections<SiteSection>("homepage", 60),
    serverGetPublishedContent<ContentItem>({ contentType: "NEWS", size: 3, revalidate: 60 }),
    serverGetUpcomingEvents<Event>(60),
    serverGetBoardMembers<BoardMember>(300),
    serverGetMemberProfiles<MemberProfile>(0, 50, 300),
  ]);

  return (
    <HomepageClient
      initialSections={sections ?? []}
      initialNews={newsResult?.content ?? []}
      initialEvents={eventsResult ?? []}
      initialBoardMembers={boardMembers ?? []}
      initialMembers={membersResult?.content ?? []}
    />
  );
}
