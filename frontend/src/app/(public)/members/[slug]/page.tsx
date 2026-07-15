"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { almarai } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import type { User, MemberProfile } from "@/types";
import { ArrowLeft, Mail, Building2, GraduationCap, Briefcase, BookOpen, Globe, Award, RefreshCw, Users, AlertCircle } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";


interface MemberDetail {
  user: User;
  profile?: MemberProfile;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getBadgeColor(type?: string) {
  switch (type) {
    case "Regular": return "bg-forest-light/10 text-forest DEFAULT border-forest-light/30";
    case "Student": return "bg-soil-clay/10 text-soil-clay border-soil-clay/30";
    case "Honorary": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Life": return "bg-purple-100 text-purple-700 border-purple-300";
    case "Board": return "bg-blue-100 text-blue-700 border-blue-300";
    case "Founder": return "bg-soil-dark/10 text-soil-dark border-soil-dark/30";
    default: return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchMember = () => {
    if (!params.slug) return;
    setLoading(true);
    setError(false);
    setNotFound(false);
    api.get(`/public/members/${params.slug}`)
      .then((res) => {
        if (res.data.success) {
          setMember(res.data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMember();
  }, [params.slug]);

  if (loading) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="animate-pulse">
              <div className="h-4 bg-soil-sand/30 rounded w-24 mb-6" />
              <div className="h-10 bg-soil-sand/30 rounded w-64 mb-4" />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-40 h-40 rounded-full bg-soil-sand/50 shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-soil-sand/50 rounded w-1/3" />
                  <div className="h-4 bg-soil-sand/50 rounded w-1/2" />
                  <div className="h-4 bg-soil-sand/50 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-soil-sand/50 rounded w-full" />
              <div className="h-4 bg-soil-sand/50 rounded w-5/6" />
              <div className="h-4 bg-soil-sand/50 rounded w-2/3" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <Link href="/members" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Members
            </Link>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <Users className="h-16 w-16 text-earth-gray/40 mx-auto mb-6" />
            <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-3`}>
              Member Not Found
            </h2>
            <p className="text-earth-gray mb-6">
              The member you are looking for does not exist or their profile is not public.
            </p>
            <Link href="/members">
              <Button className="bg-soil-clay hover:bg-soil-dark text-white">Browse All Members</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div>
        <section className="bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <Link href="/members" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Members
            </Link>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <AlertCircle className="h-16 w-16 text-earth-gray/40 mx-auto mb-6" />
            <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-3`}>
              Failed to Load Profile
            </h2>
            <p className="text-earth-gray mb-6">
              Something went wrong while loading this member profile. Please try again.
            </p>
            <Button onClick={fetchMember} className="bg-soil-clay hover:bg-soil-dark text-white">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const { user, profile } = member;
  const fullName = `${user.firstNameEn || ""} ${user.lastNameEn || ""}`.trim() || user.username;
  const initial = (user.firstNameEn?.[0] || user.lastNameEn?.[0] || "?").toUpperCase();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path d="M0,200 C200,50 400,300 600,150 C800,0 1000,250 1000,150 L1000,400 L0,400 Z" fill="#D7CCC8" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <Link href="/members" className="inline-flex items-center gap-2 text-soil-sand hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Members
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={fullName}
                loading="lazy"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-soil-sand/30 shrink-0"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-soil-clay to-soil-dark flex items-center justify-center shrink-0 border-4 border-soil-sand/30">
                <span className="text-white text-5xl font-bold">{initial}</span>
              </div>
            )}
            <div className="text-center md:text-left">
              <TextReveal as="h1" className={`${almarai.className} fluid-3xl md:fluid-4xl lg:fluid-5xl font-bold`}>{fullName}</TextReveal>
              {user.position && (
                <p className="fluid-lg text-soil-sand mt-2">{user.position}</p>
              )}
              {profile?.membershipType && (
                <span className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full border ${getBadgeColor(profile.membershipType)} bg-white/10 text-white border-white/30`}>
                  {profile.membershipType} Member
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 @container">
            <div className="md:col-span-2 space-y-8">
              {user.biography && (
                <div>
                  <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-4`}>
                    Biography
                  </h2>
                  <p className="text-earth-gray leading-relaxed whitespace-pre-line">{user.biography}</p>
                </div>
              )}

              {user.specialization && (
                <div>
                  <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-4`}>
                    Specialization
                  </h2>
                  <p className="text-earth-gray leading-relaxed">{user.specialization}</p>
                </div>
              )}

              {profile?.researchInterests && (
                <div>
                  <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-4`}>
                    Research Interests
                  </h2>
                  <p className="text-earth-gray leading-relaxed whitespace-pre-line">{profile.researchInterests}</p>
                </div>
              )}

              {profile?.education && (
                <div>
                  <h2 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-4`}>
                    Education
                  </h2>
                  <p className="text-earth-gray leading-relaxed whitespace-pre-line">{profile.education}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border-soil-sand/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-soil-dark">Contact</h3>
                  {user.email && (
                    <a
                      href={`mailto:${user.email}`}
                      className="flex items-center gap-3 fluid-sm text-soil-clay hover:text-soil-dark transition-colors"
                    >
                      <Mail className="h-5 w-5 shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </a>
                  )}
                  {user.phone && (
                    <a
                      href={`tel:${user.phone}`}
                      className="flex items-center gap-3 fluid-sm text-earth-gray hover:text-soil-dark transition-colors"
                    >
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span>{user.phone}</span>
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card className="border-soil-sand/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-soil-dark">Professional Info</h3>
                  {user.institution && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Institution</p>
                        <p className="fluid-sm text-earth-gray">{user.institution}</p>
                      </div>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Department</p>
                        <p className="fluid-sm text-earth-gray">{user.department}</p>
                      </div>
                    </div>
                  )}
                  {user.position && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Position</p>
                        <p className="fluid-sm text-earth-gray">{user.position}</p>
                      </div>
                    </div>
                  )}
                  {user.specialization && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                      <div>
                        <p className="fluid-sm font-medium text-soil-dark">Specialization</p>
                        <p className="fluid-sm text-earth-gray">{user.specialization}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {profile && (
                <Card className="border-soil-sand/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-soil-dark">Membership</h3>
                    {profile.membershipType && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                        <div>
                          <p className="fluid-sm font-medium text-soil-dark">Type</p>
                          <p className="fluid-sm text-earth-gray">{profile.membershipType}</p>
                        </div>
                      </div>
                    )}
                    {profile.membershipNumber && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                        <div>
                          <p className="fluid-sm font-medium text-soil-dark">Member #</p>
                          <p className="fluid-sm text-earth-gray">{profile.membershipNumber}</p>
                        </div>
                      </div>
                    )}
                    {profile.publicationsCount != null && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                        <div>
                          <p className="fluid-sm font-medium text-soil-dark">Publications</p>
                          <p className="fluid-sm text-earth-gray">{profile.publicationsCount}</p>
                        </div>
                      </div>
                    )}
                    {profile.joinedAt && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-soil-clay mt-0.5 shrink-0" />
                        <div>
                          <p className="fluid-sm font-medium text-soil-dark">Member Since</p>
                          <p className="fluid-sm text-earth-gray">{formatDate(profile.joinedAt)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {(profile?.orcidId || profile?.googleScholarUrl || profile?.linkedinUrl) && (
                <Card className="border-soil-sand/50">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-semibold text-soil-dark">Links</h3>
                    {profile?.orcidId && (
                      <a
                        href={`https://orcid.org/${profile.orcidId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 fluid-sm text-soil-clay hover:text-soil-dark transition-colors"
                      >
                        <Globe className="h-4 w-4" /> ORCID
                      </a>
                    )}
                    {profile?.googleScholarUrl && (
                      <a
                        href={profile.googleScholarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 fluid-sm text-soil-clay hover:text-soil-dark transition-colors"
                      >
                        <Globe className="h-4 w-4" /> Google Scholar
                      </a>
                    )}
                    {profile?.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 fluid-sm text-soil-clay hover:text-soil-dark transition-colors"
                      >
                        <Globe className="h-4 w-4" /> LinkedIn
                      </a>
                    )}
                    {user.address && (
                      <span className="flex items-center gap-2 text-sm text-earth-gray">
                        <Building2 className="h-4 w-4" /> {user.address}{user.city ? `, ${user.city}` : ""}{user.country ? `, ${user.country}` : ""}
                      </span>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
