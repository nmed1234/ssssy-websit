"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, X, Filter, ArrowLeft } from "lucide-react";
import { almarai } from "@/lib/fonts";
import api from "@/lib/api";
import { PageHero } from "@/components/ui/page-hero";


interface Member {
  id: string;
  firstNameEn: string;
  lastNameEn: string;
  institution?: string;
  specialization?: string;
  photoUrl?: string;
  membershipType: string;
}

// These are only used as fallback when the API cannot return filter options
const FALLBACK_MEMBERSHIP_TYPES = ["", "Regular", "Student", "Honorary", "Life", "Board", "Founder"];
const FALLBACK_SPECIALIZATIONS = [
  "",
  "Soil Science",
  "Agronomy",
  "Environmental Science",
  "Geology",
  "Hydrology",
  "Ecology",
  "Agricultural Engineering",
  "Land Management",
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endpointMissing, setEndpointMissing] = useState(false);

  // Filter options loaded from DB
  const [membershipTypes, setMembershipTypes] = useState<string[]>(FALLBACK_MEMBERSHIP_TYPES);
  const [specializations, setSpecializations] = useState<string[]>(FALLBACK_SPECIALIZATIONS);

  const [keyword, setKeyword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [institution, setInstitution] = useState("");
  const [membershipType, setMembershipType] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const pageSize = 12;

  // Load distinct filter values from the members API
  useEffect(() => {
    api.get<{ success: boolean; data: string[] }>("/public/users/members/membership-types")
      .then((res) => { if (res.data.success && res.data.data.length > 0) setMembershipTypes(["", ...res.data.data]); })
      .catch(() => {/* keep fallback */});

    api.get<{ success: boolean; data: string[] }>("/public/users/members/specializations")
      .then((res) => { if (res.data.success && res.data.data.length > 0) setSpecializations(["", ...res.data.data]); })
      .catch(() => {/* keep fallback */});
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEndpointMissing(false);

    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (specialization) params.set("specialization", specialization);
      if (institution) params.set("institution", institution);
      if (membershipType) params.set("membershipType", membershipType);
      params.set("page", String(page));
      params.set("size", String(pageSize));

      const response = await api.get(`/public/users/members?${params.toString()}`);
      const body = response.data;

      if (body.success) {
        const raw = body.data;
        if (Array.isArray(raw)) {
          setMembers(raw);
          setTotalPages(1);
          setTotalElements(raw.length);
        } else if (raw.content) {
          setMembers(raw.content);
          setTotalPages(raw.totalPages || 1);
          setTotalElements(raw.totalElements || raw.content.length);
        } else {
          setMembers([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setError(body.message || "Failed to load members.");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setEndpointMissing(true);
        setMembers([]);
      } else {
        setError(err.response?.data?.message || "Failed to load members. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [keyword, specialization, institution, membershipType, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchMembers();
  };

  const handleReset = () => {
    setKeyword("");
    setSpecialization("");
    setInstitution("");
    setMembershipType("");
    setPage(0);
  };

  const getInitial = (member: Member) => {
    return (member.firstNameEn?.[0] || member.lastNameEn?.[0] || "?").toUpperCase();
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Regular": return "bg-forest-light/10 text-forest border-forest/30";
      case "Student": return "bg-soil-clay/10 text-soil-clay border-soil-clay/30";
      case "Honorary": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Life": return "bg-purple-100 text-purple-700 border-purple-300";
      case "Board": return "bg-blue-100 text-blue-700 border-blue-300";
      case "Founder": return "bg-soil-dark/10 text-soil-dark border-soil-dark/30";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div>
      <PageHero slug="members" defaultTitle="Members" defaultSubtitleAr="الأعضاء" />

      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          {endpointMissing ? (
            <div className="text-center py-16 max-w-lg mx-auto">
              <Users className="h-16 w-16 text-soil-sand mx-auto mb-6" />
              <h3 className={`${almarai.className} fluid-2xl font-bold text-soil-dark mb-3`}>
                Member Directory
              </h3>
              <p className="text-earth-gray mb-6 leading-relaxed">
                Member directory coming soon. Please log in to view full member profiles.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/login">
                  <Button className="bg-soil-clay hover:bg-soil-dark text-white">Log In</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-soil-sand text-soil-clay">Go Home</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <SearchFilters
                keyword={keyword}
                setKeyword={setKeyword}
                specialization={specialization}
                setSpecialization={setSpecialization}
                institution={institution}
                setInstitution={setInstitution}
                membershipType={membershipType}
                setMembershipType={setMembershipType}
                membershipTypes={membershipTypes}
                specializations={specializations}
                onSearch={handleSearch}
                onReset={handleReset}
              />

              <div className="mt-8">
                {loading ? (
                  <LoadingGrid />
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-earth-gray">{error}</p>
                    <Button onClick={fetchMembers} className="mt-4 bg-soil-clay hover:bg-soil-dark text-white">
                      Try Again
                    </Button>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 text-soil-sand mx-auto mb-4" />
                    <p className="text-earth-gray fluid-lg mb-2">No members found</p>
                    <p className="text-earth-gray fluid-sm">Try adjusting your search filters.</p>
                  </div>
                ) : (
                  <>
                    <p className="fluid-sm text-earth-gray mb-4">
                      Showing {members.length} of {totalElements} member{totalElements !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {members.map((member) => (
                        <Card
                          key={member.id}
                          className="hover:shadow-md transition-shadow cursor-pointer border border-soil-sand/50"
                          onClick={() => setSelectedMember(member)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-soil-clay to-soil-dark flex items-center justify-center mx-auto mb-4">
                              <span className="text-white text-xl font-bold">{getInitial(member)}</span>
                            </div>
                            <h3 className="font-semibold text-soil-dark mb-1">
                              {member.firstNameEn} {member.lastNameEn}
                            </h3>
                            {member.institution && (
                              <p className="fluid-sm text-earth-gray mb-1">{member.institution}</p>
                            )}
                            {member.specialization && (
                              <p className="text-xs text-soil-clay mb-3">{member.specialization}</p>
                            )}
                            {member.membershipType && (
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(member.membershipType)}`}>
                                {member.membershipType}
                              </span>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedMember && (
        <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}

function SearchFilters({
  keyword, setKeyword,
  specialization, setSpecialization,
  institution, setInstitution,
  membershipType, setMembershipType,
  membershipTypes, specializations,
  onSearch, onReset,
}: {
  keyword: string; setKeyword: (v: string) => void;
  specialization: string; setSpecialization: (v: string) => void;
  institution: string; setInstitution: (v: string) => void;
  membershipType: string; setMembershipType: (v: string) => void;
  membershipTypes: string[];
  specializations: string[];
  onSearch: (e: React.FormEvent) => void;
  onReset: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="bg-soil-cream/30 rounded-lg p-6 border border-soil-sand/30">
      <form onSubmit={onSearch}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
            <input
              type="text"
              placeholder="Search members by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-soil-sand bg-white text-soil-dark placeholder:text-earth-gray/50 focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent"
            />
          </div>
          <Button type="submit" className="bg-soil-clay hover:bg-soil-dark text-white">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="border-soil-sand text-soil-clay"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-soil-sand/30">
            <div>
              <label className="block text-sm font-medium text-soil-dark mb-1">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-soil-sand bg-white text-soil-dark focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent"
              >
                {specializations.map((s) => (
                  <option key={s} value={s}>{s || "All Specializations"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-dark mb-1">Institution</label>
              <input
                type="text"
                placeholder="e.g., Damascus University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-soil-sand bg-white text-soil-dark placeholder:text-earth-gray/50 focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil-dark mb-1">Membership Type</label>
              <select
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-soil-sand bg-white text-soil-dark focus:outline-none focus:ring-2 focus:ring-soil-clay focus:border-transparent"
              >
                {membershipTypes.map((t) => (
                  <option key={t} value={t}>{t || "All Types"}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                className="text-earth-gray hover:text-soil-dark"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse border border-soil-sand/50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-soil-sand/50 mx-auto mb-4" />
            <div className="h-4 bg-soil-sand/50 rounded w-2/3 mx-auto mb-2" />
            <div className="h-3 bg-soil-sand/50 rounded w-1/2 mx-auto mb-1" />
            <div className="h-3 bg-soil-sand/50 rounded w-1/3 mx-auto mb-3" />
            <div className="h-5 bg-soil-sand/50 rounded w-1/4 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="border-soil-sand text-soil-clay"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-earth-gray">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={
              p === page
                ? "bg-soil-clay hover:bg-soil-dark text-white"
                : "border-soil-sand text-soil-clay"
            }
          >
            {p + 1}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="border-soil-sand text-soil-clay"
      >
        <ArrowLeft className="h-4 w-4 rotate-180" />
      </Button>
    </div>
  );
}

function MemberModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const getInitial = (m: Member) =>
    (m.firstNameEn?.[0] || m.lastNameEn?.[0] || "?").toUpperCase();

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Regular": return "bg-forest-light/10 text-forest border-forest/30";
      case "Student": return "bg-soil-clay/10 text-soil-clay border-soil-clay/30";
      case "Honorary": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Life": return "bg-purple-100 text-purple-700 border-purple-300";
      case "Board": return "bg-blue-100 text-blue-700 border-blue-300";
      case "Founder": return "bg-soil-dark/10 text-soil-dark border-soil-dark/30";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-earth-gray hover:text-soil-dark transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-soil-clay to-soil-dark flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">{getInitial(member)}</span>
            </div>
            <h2 className={`${almarai.className} text-2xl font-bold text-soil-dark`}>
              {member.firstNameEn} {member.lastNameEn}
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            {member.membershipType && (
              <div className="flex justify-between items-center">
                <span className="text-earth-gray">Membership</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(member.membershipType)}`}>
                  {member.membershipType}
                </span>
              </div>
            )}
            {member.institution && (
              <div className="flex justify-between">
                <span className="text-earth-gray">Institution</span>
                <span className="text-soil-dark font-medium text-right">{member.institution}</span>
              </div>
            )}
            {member.specialization && (
              <div className="flex justify-between">
                <span className="text-earth-gray">Specialization</span>
                <span className="text-soil-dark font-medium text-right">{member.specialization}</span>
              </div>
            )}
          </div>

          {(member as any).email && (
            <div className="mt-4 pt-4 border-t border-soil-sand/30">
              <p className="text-xs text-earth-gray">Email: {(member as any).email}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-earth-gray/60">
              Additional profile details will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
